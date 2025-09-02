// Audio Fallback System for Korean Learning App
console.log('%c 🔊 Korean Audio Fallback System v2 loaded', 'background: #5782BB; color: white; padding: 4px 8px; border-radius: 4px; font-weight: bold;');

// Audio cache to prevent reloading the same sounds
const audioCache = {};

// Common Korean phrases that need audio fallback
const commonPhrases = {
  '안녕하세요': 'annyeonghaseyo',
  '감사합니다': 'gamsahamnida',
  '네': 'ne',
  '아니요': 'aniyo',
  '어디예요': 'eodiyeyo',
  '맛있어요': 'masisseoyo',
  '물': 'mul',
  '주세요': 'juseyo',
  '안녕': 'annyeong',
  '고마워요': 'gomawoyo',
  '저는': 'jeoneun',
  '이름': 'ireum',
  '반갑습니다': 'bangapseumnida',
  '화장실': 'hwajangsil',
  '얼마예요': 'eolmayeyo',
  '괜찮아요': 'gwaenchanayo',
  '미안합니다': 'mianhamnida'
};

// Simple function to update UI buttons
function updateAudioButtons(text, isPlaying, hasError = false) {
  const buttons = document.querySelectorAll(`[data-text="${text}"]`);
  
  buttons.forEach(button => {
    if (isPlaying) {
      button.innerHTML = '<span class="audio-status playing"></span> Playing...';
      button.disabled = true;
      button.classList.add('playing');
      button.classList.remove('error');
    } else if (hasError) {
      button.innerHTML = '<span class="audio-status error"></span> Failed';
      button.disabled = false;
      button.classList.add('error');
      button.classList.remove('playing');
      
      // Reset after 2 seconds
      setTimeout(() => {
        button.innerHTML = '<span class="audio-status ready"></span> Listen';
        button.classList.remove('error');
      }, 2000);
    } else {
      button.innerHTML = '<span class="audio-status ready"></span> Listen';
      button.disabled = false;
      button.classList.remove('playing');
      button.classList.remove('error');
    }
  });
}

// Function to get audio URL for a Korean text
function getAudioUrl(text) {
  // Use direct Google Translate TTS URL - this is the most reliable
  return `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=ko-KR&client=tw-ob`;
}

// Function to play audio
function playAudio(text) {
  console.log(`Attempting to play audio for: "${text}"`);
  
  // Update UI to show loading state
  updateAudioButtons(text, true);
  
  // Check if we have this audio cached
  if (audioCache[text] && audioCache[text].canPlayType && audioCache[text].canPlayType('audio/mpeg')) {
    try {
      console.log(`Using cached audio for: "${text}"`);
      
      // Play the cached audio
      audioCache[text].currentTime = 0;
      
      const playPromise = audioCache[text].play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            console.log(`Audio playing successfully for: "${text}"`);
            // Good - audio is playing
            
            // Reset button after audio completes
            audioCache[text].onended = () => {
              console.log(`Audio completed for: "${text}"`);
              updateAudioButtons(text, false);
            };
          })
          .catch(error => {
            console.error(`Error playing cached audio for "${text}":`, error);
            // Try creating a fresh audio object
            loadAndPlayFreshAudio(text);
          });
      }
    } catch (error) {
      console.error(`Error with cached audio for "${text}":`, error);
      // Try creating a fresh audio object
      loadAndPlayFreshAudio(text);
    }
  } else {
    // No cached audio, create a new one
    loadAndPlayFreshAudio(text);
  }
}

// Function to load and play fresh audio
function loadAndPlayFreshAudio(text) {
  try {
    console.log(`Creating fresh audio for: "${text}"`);
    
    // Create a new audio element
    const audio = new Audio();
    
    // Set up event listeners before setting the source
    audio.oncanplaythrough = () => {
      console.log(`Audio loaded and ready to play for: "${text}"`);
      
      try {
        // Play the audio
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log(`Fresh audio playing successfully for: "${text}"`);
              
              // Reset button after audio completes
              audio.onended = () => {
                console.log(`Audio completed for: "${text}"`);
                updateAudioButtons(text, false);
              };
              
              // Cache this audio for future use
              audioCache[text] = audio;
            })
            .catch(error => {
              console.error(`Error playing fresh audio for "${text}":`, error);
              updateAudioButtons(text, false, true);
              
              // Try one more approach - inline audio element
              playWithInlineElement(text);
            });
        }
      } catch (error) {
        console.error(`Error after loading fresh audio for "${text}":`, error);
        updateAudioButtons(text, false, true);
        
        // Try one more approach - inline audio element
        playWithInlineElement(text);
      }
    };
    
    // Error handler
    audio.onerror = (error) => {
      console.error(`Error loading audio for "${text}":`, error);
      updateAudioButtons(text, false, true);
      
      // Try one more approach - inline audio element
      playWithInlineElement(text);
    };
    
    // Set the timeout handler in case it never loads
    const timeoutId = setTimeout(() => {
      if (!audio.canPlayType || audio.readyState < 3) {
        console.warn(`Timeout loading audio for "${text}"`);
        updateAudioButtons(text, false, true);
        
        // Try one more approach - inline audio element
        playWithInlineElement(text);
      }
    }, 5000);
    
    // Handler to clear the timeout if loaded
    audio.onloadeddata = () => {
      clearTimeout(timeoutId);
    };
    
    // Now set the source and load the audio
    audio.src = getAudioUrl(text);
    audio.load();
    
  } catch (error) {
    console.error(`Error creating audio for "${text}":`, error);
    updateAudioButtons(text, false, true);
    
    // Try one more approach - inline audio element
    playWithInlineElement(text);
  }
}

// Function to play audio using an inline element added to the DOM
function playWithInlineElement(text) {
  console.log(`Trying inline audio element for: "${text}"`);
  
  try {
    // Create a container for the audio element
    const audioContainer = document.createElement('div');
    audioContainer.style.display = 'none';
    audioContainer.id = `audio-container-${Date.now()}`;
    
    // Create the audio element
    const audioEl = document.createElement('audio');
    audioEl.controls = true;
    audioEl.autoplay = true;
    
    // Add a source element for better browser compatibility
    const source = document.createElement('source');
    source.src = getAudioUrl(text);
    source.type = 'audio/mpeg';
    
    // Set up handlers
    audioEl.onplay = () => {
      console.log(`Inline audio playing for: "${text}"`);
    };
    
    audioEl.onended = () => {
      console.log(`Inline audio completed for: "${text}"`);
      updateAudioButtons(text, false);
      // Clean up by removing from DOM after playing
      if (audioContainer.parentNode) {
        audioContainer.parentNode.removeChild(audioContainer);
      }
    };
    
    audioEl.onerror = (error) => {
      console.error(`Error with inline audio for "${text}":`, error);
      updateAudioButtons(text, false, true);
      // Clean up on error too
      if (audioContainer.parentNode) {
        audioContainer.parentNode.removeChild(audioContainer);
      }
      
      // Final resort - redirect to Google Translate directly
      offerTranslateRedirect(text);
    };
    
    // Assemble and add to document
    audioEl.appendChild(source);
    audioContainer.appendChild(audioEl);
    document.body.appendChild(audioContainer);
    
  } catch (error) {
    console.error(`Error with inline audio element for "${text}":`, error);
    updateAudioButtons(text, false, true);
    
    // Final resort - redirect to Google Translate directly
    offerTranslateRedirect(text);
  }
}

// Function to offer redirect to Google Translate
function offerTranslateRedirect(text) {
  const url = `https://translate.google.com/?sl=ko&tl=en&text=${encodeURIComponent(text)}&op=translate`;
  
  if (confirm(`Unable to play audio for "${text}". Would you like to hear it on Google Translate?`)) {
    window.open(url, '_blank');
  }
}

// Play audio via the most direct route - can be called from study.js
function playAudioFallback(text) {
  playAudio(text);
  return Promise.resolve(true); // For compatibility with calling code
}

// Main entry point - called when a speak button is clicked
function handleSpeakButtonClick(event) {
  const text = event.target.getAttribute('data-text');
  if (text) {
    playAudio(text);
  }
}

// Set up event delegation for speak buttons
document.addEventListener('click', (event) => {
  if (event.target.classList.contains('speak-btn') || 
      event.target.parentElement.classList.contains('speak-btn')) {
    
    // Get the button element (could be the span inside the button)
    const button = event.target.classList.contains('speak-btn') ? 
                  event.target : 
                  event.target.parentElement;
    
    const text = button.getAttribute('data-text');
    if (text) {
      playAudio(text);
    }
  }
});

// Initialize when the document is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('Audio fallback system initialized and ready');
  
  // Pre-cache common phrases in the background
  setTimeout(() => {
    Object.keys(commonPhrases).forEach(phrase => {
      const audio = new Audio(getAudioUrl(phrase));
      audio.load();
      audioCache[phrase] = audio;
      console.log(`Pre-cached audio for: "${phrase}"`);
    });
  }, 2000);
});

// Export functions for use in study.js
window.AudioFallback = {
  playAudioFallback,
  handleSpeakButtonClick
}; 