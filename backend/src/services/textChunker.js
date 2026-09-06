const MAX_CHARACTERS = 6000;

const chunkText = (text) => {
  if (!text || typeof text !== 'string') return [];
  
  const chunks = [];
  const addChunk = (chunk) => {
    const t = chunk.trim();
    if (t.length > 0) chunks.push(t);
  };
  
  const paragraphs = text.split('\n\n');
  let currentChunk = '';
  
  for (const p of paragraphs) {
    if (currentChunk.length + p.length + 2 <= MAX_CHARACTERS) {
      currentChunk = currentChunk ? currentChunk + '\n\n' + p : p;
    } else {
      if (currentChunk) {
        addChunk(currentChunk);
        currentChunk = '';
      }
      
      if (p.length <= MAX_CHARACTERS) {
        currentChunk = p;
      } else {
        // Fallback: split by sentences
        const sentences = p.match(/[^.!?]+[.!?]+/g) || [p];
        let currentSentenceChunk = '';
        
        for (const s of sentences) {
          if (currentSentenceChunk.length + s.length + 1 <= MAX_CHARACTERS) {
            currentSentenceChunk = currentSentenceChunk ? currentSentenceChunk + ' ' + s.trim() : s.trim();
          } else {
            if (currentSentenceChunk) {
              addChunk(currentSentenceChunk);
              currentSentenceChunk = '';
            }
            
            if (s.length <= MAX_CHARACTERS) {
              currentSentenceChunk = s.trim();
            } else {
              // Fallback: split by words
              const words = s.split(/\s+/);
              let currentWordChunk = '';
              for (const w of words) {
                if (currentWordChunk.length + w.length + 1 <= MAX_CHARACTERS) {
                  currentWordChunk = currentWordChunk ? currentWordChunk + ' ' + w : w;
                } else {
                  if (currentWordChunk) {
                    addChunk(currentWordChunk);
                    currentWordChunk = '';
                  }
                  
                  if (w.length > MAX_CHARACTERS) {
                     for (let i = 0; i < w.length; i += MAX_CHARACTERS) {
                        addChunk(w.substring(i, i + MAX_CHARACTERS));
                     }
                  } else {
                    currentWordChunk = w;
                  }
                }
              }
              if (currentWordChunk) {
                currentSentenceChunk = currentWordChunk;
              }
            }
          }
        }
        if (currentSentenceChunk) {
           currentChunk = currentSentenceChunk;
        }
      }
    }
  }
  
  if (currentChunk) {
    addChunk(currentChunk);
  }
  
  return chunks.map((chunkText, index) => ({
    text: chunkText,
    chunkIndex: index
  }));
};

module.exports = {
  chunkText,
};
