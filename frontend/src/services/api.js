/**
 * WebInsight Frontend API Client
 * Connects to the Flask REST backend.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

/**
 * Analyzes a target website URL.
 * @param {string} url - Website URL entered by user
 * @returns {Promise<object>} Analysis and summary data
 */
export async function analyzeWebsite(url) {
  try {
    const response = await fetch(`${API_BASE_URL}/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Server returned error (${response.status})`);
    }

    return data;
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error('Unable to connect to WebInsight backend server. Please verify the backend is running.');
    }
    throw error;
  }
}

/**
 * Sends a question regarding the analyzed website's extracted content.
 * @param {string} sessionId - Active session ID from analyzeWebsite
 * @param {string} question - User question
 * @returns {Promise<object>} Q&A response
 */
export async function askWebsiteQuestion(sessionId, question) {
  try {
    const response = await fetch(`${API_BASE_URL}/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        session_id: sessionId,
        question: question.trim(),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `Server returned error (${response.status})`);
    }

    return data;
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      throw new Error('Unable to reach the backend server to answer your question.');
    }
    throw error;
  }
}

/**
 * Verifies backend health and status.
 * @returns {Promise<object>}
 */
export async function checkBackendHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    if (!response.ok) return { status: 'down' };
    return await response.json();
  } catch (e) {
    return { status: 'unreachable', error: e.message };
  }
}
