const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

async function handleResponse(response) {
  if (!response.ok) {
    let errorMessage = 'An error occurred while communicating with the server.';
    try {
      const errData = await response.json();
      errorMessage = errData.detail || errorMessage;
    } catch (e) {}
    throw new Error(errorMessage);
  }
  return response.json();
}

export const apiService = {
  // Authentication & Profile Services
  auth: {
    async register(id, name, email) {
      return fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name, email })
      }).then(handleResponse);
    },
    async login(id) {
      return fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      }).then(handleResponse);
    },
    async google(id, name, email) {
      return fetch(`${BASE_URL}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name, email })
      }).then(handleResponse);
    },
    async logout() {
      return fetch(`${BASE_URL}/auth/logout`, {
        method: 'POST'
      }).then(handleResponse);
    },
    async getProfile(userId) {
      return fetch(`${BASE_URL}/auth/profile/${userId}`).then(handleResponse);
    }
  },

  // Resume Services
  resume: {
    async upload(userId, file) {
      const formData = new FormData();
      formData.append('user_id', userId);
      formData.append('file', file);

      return fetch(`${BASE_URL}/resume/upload`, {
        method: 'POST',
        body: formData
      }).then(handleResponse);
    },
    async getAnalysis(userId) {
      return fetch(`${BASE_URL}/resume/analysis/${userId}`).then(handleResponse);
    }
  },

  // Interview Sessions Services
  interview: {
    async startSession(userId, category, difficulty, questionCount = 10) {
      return fetch(`${BASE_URL}/interview/sessions/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          category,
          difficulty,
          question_count: questionCount
        })
      }).then(handleResponse);
    },
    async submitAnswer(sessionId, questionId, userAnswer) {
      return fetch(`${BASE_URL}/interview/sessions/${sessionId}/answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question_id: questionId, user_answer: userAnswer })
      }).then(handleResponse);
    },
    async endSession(sessionId) {
      return fetch(`${BASE_URL}/interview/sessions/${sessionId}/end`, {
        method: 'POST'
      }).then(handleResponse);
    },
    async getHistory(userId) {
      return fetch(`${BASE_URL}/interview/history/${userId}`).then(handleResponse);
    },
    getReportURL(sessionId) {
      return `${BASE_URL}/interview/sessions/${sessionId}/report`;
    },
    async transcribeAudio(userId, audioBlob) {
      const formData = new FormData();
      formData.append('user_id', userId);
      formData.append('file', audioBlob, 'answer_clip.wav');

      return fetch(`${BASE_URL}/interview/transcribe`, {
        method: 'POST',
        body: formData
      }).then(handleResponse);
    }
  },

  // Career Services
  career: {
    async getRecommendations(userId) {
      return fetch(`${BASE_URL}/career/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId })
      }).then(handleResponse);
    },
    async getLinkedInProfile(userId) {
      return fetch(`${BASE_URL}/career/linkedin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId })
      }).then(handleResponse);
    }
  },

  // Admin Services
  admin: {
    async getStats(userId) {
      return fetch(`${BASE_URL}/admin/stats?user_id=${userId}`).then(handleResponse);
    },
    async listUsers(userId) {
      return fetch(`${BASE_URL}/admin/users?user_id=${userId}`).then(handleResponse);
    },
    async listResumes(userId) {
      return fetch(`${BASE_URL}/admin/resumes?user_id=${userId}`).then(handleResponse);
    }
  }
};
export default apiService;

