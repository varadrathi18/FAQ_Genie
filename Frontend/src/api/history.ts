import { projectsApi } from './projects';
import { generationsApi } from './generations';
import { HistoryGeneration, GenerationDetail } from '../types';

export const historyApi = {
  getHistoryList: async (): Promise<HistoryGeneration[]> => {
    // 1. Fetch all projects for the user
    const projectsResponse = await projectsApi.getProjects();
    const projects = projectsResponse.projects;

    // 2. Fetch generations for all projects in parallel
    const allGenerationsNested = await Promise.all(
      projects.map(async (project) => {
        try {
          const genResponse = await generationsApi.getGenerations(project.id);
          // 3. Map to the HistoryGeneration frontend model
          return genResponse.generations.map((gen: any) => ({
            generationId: gen.generationId,
            projectId: project.id,
            projectName: project.title,
            projectUrl: project.websiteUrl,
            projectDescription: project.description,
            version: gen.version,
            createdAt: gen.createdAt,
            faqCount: gen.faqCount,
            selectedFaqCount: gen.selectedFaqCount,
            seoScore: gen.seoScore,
            publicationStatus: gen.publicationStatus
          } as HistoryGeneration));
        } catch (error) {
          console.error(`Failed to fetch generations for project ${project.id}`, error);
          return [];
        }
      })
    );

    // 4. Flatten the array and sort by createdAt descending
    const flattenedHistory = allGenerationsNested.flat();
    flattenedHistory.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return flattenedHistory;
  },

  getGenerationDetail: async (projectId: string, generationId: string): Promise<GenerationDetail> => {
    return generationsApi.getGeneration(projectId, generationId);
  }
};
