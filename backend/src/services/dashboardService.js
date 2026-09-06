const mongoose = require('mongoose');
const Project = require('../models/Project');
const Generation = require('../models/Generation');
const FAQ = require('../models/FAQ');

const getDashboard = async (userId) => {
  const userObjectId = new mongoose.Types.ObjectId(userId);

  // 1. Overview Metrics
  const projectCountPromise = Project.countDocuments({ userId: userObjectId });
  
  const publishedCountPromise = Generation.countDocuments({ 
    userId: userObjectId, 
    'publication.status': 'published' 
  });

  const averageSeoScorePromise = Generation.aggregate([
    { $match: { userId: userObjectId, 'seoAnalysis.score': { $ne: null } } },
    { $group: { _id: null, avgScore: { $avg: '$seoAnalysis.score' } } }
  ]);

  const faqCountsPromise = FAQ.aggregate([
    { $match: { userId: userObjectId } },
    { 
      $group: { 
        _id: null, 
        total: { $sum: 1 }, 
        selected: { $sum: { $cond: ['$selected', 1, 0] } } 
      } 
    }
  ]);

  // 2. Recent Projects
  const recentProjectsPromise = Project.find({ userId: userObjectId })
    .sort({ updatedAt: -1 })
    .limit(5)
    .lean();

  // 3. Recent Generations
  const recentGenerationsPromise = Generation.find({ userId: userObjectId })
    .sort({ createdAt: -1 })
    .limit(10)
    .lean();

  // Execute base queries concurrently
  const [
    projectCount,
    publishedCount,
    averageSeoScoreResult,
    faqCountsResult,
    recentProjectsRaw,
    recentGenerationsRaw
  ] = await Promise.all([
    projectCountPromise,
    publishedCountPromise,
    averageSeoScorePromise,
    faqCountsPromise,
    recentProjectsPromise,
    recentGenerationsPromise
  ]);

  // Parse Overview Results
  const averageSeoScore = averageSeoScoreResult.length > 0 ? Math.round(averageSeoScoreResult[0].avgScore) : null;
  const faqCount = faqCountsResult.length > 0 ? faqCountsResult[0].total : 0;
  const selectedFaqCount = faqCountsResult.length > 0 ? faqCountsResult[0].selected : 0;

  // Process Recent Projects
  const recentProjects = await Promise.all(
    recentProjectsRaw.map(async (p) => {
      const latestGen = await Generation.findOne({ projectId: p._id }).sort({ version: -1 }).lean();
      
      let latestGeneration = null;
      if (latestGen) {
        latestGeneration = {
          generationId: latestGen._id,
          version: latestGen.version,
          seoScore: latestGen.seoAnalysis?.score || null,
          publicationStatus: latestGen.publication?.status || null
        };
      }

      return {
        projectId: p._id,
        title: p.title,
        description: p.description,
        status: 'active', // Derived safely
        updatedAt: p.updatedAt,
        latestGeneration
      };
    })
  );

  // Process Recent Generations
  let recentGenerations = [];
  if (recentGenerationsRaw.length > 0) {
    const generationIds = recentGenerationsRaw.map(g => g._id);
    const projectIds = recentGenerationsRaw.map(g => g.projectId);
    
    // Concurrently fetch titles and FAQ aggregates
    const [projectsForGen, generationFaqCounts] = await Promise.all([
      Project.find({ _id: { $in: projectIds } }).select('_id title').lean(),
      FAQ.aggregate([
        { $match: { generationId: { $in: generationIds } } },
        { 
          $group: { 
            _id: '$generationId', 
            total: { $sum: 1 }, 
            selected: { $sum: { $cond: ['$selected', 1, 0] } } 
          } 
        }
      ])
    ]);

    const projectTitleMap = {};
    for (const p of projectsForGen) {
      projectTitleMap[p._id.toString()] = p.title;
    }

    const genCountMap = {};
    for (const item of generationFaqCounts) {
      genCountMap[item._id.toString()] = {
        total: item.total,
        selected: item.selected
      };
    }

    recentGenerations = recentGenerationsRaw.map(g => {
      const counts = genCountMap[g._id.toString()] || { total: 0, selected: 0 };
      return {
        generationId: g._id,
        projectId: g.projectId,
        projectTitle: projectTitleMap[g.projectId.toString()] || 'Unknown Project',
        version: g.version,
        faqCount: counts.total,
        selectedFaqCount: counts.selected,
        seoScore: g.seoAnalysis?.score || null,
        publicationStatus: g.publication?.status || null,
        createdAt: g.createdAt
      };
    });
  }

  return {
    overview: {
      projectCount,
      faqCount,
      selectedFaqCount,
      averageSeoScore,
      publishedCount
    },
    recentProjects,
    recentGenerations
  };
};

module.exports = {
  getDashboard
};
