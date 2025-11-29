/* Events API Client
   Lightweight client used by events page. Shares auth/session data with main api-client.js
   - Reads token from localStorage `cousinsvault_token` or `cousinsvault_session`
   - Hydrates currentUser from `cousinsvault_session`
   - Listens for localStorage changes to stay in sync with login/logout from other pages
   - Exposes: getEvents(), createEvent(payload), submitRSVP(payload), getUpcoming(limit)
*/

class EventsAPIClient {
    constructor() {
        this.baseURL = window.location.origin;
        this.token = this._readStoredToken();
        this.currentUser = this._readStoredUser();
        this.initPromise = this.init();
    }

    async init() {
        // Wait for DOM ready
        if (document.readyState === 'loading') {
            await new Promise(resolve => document.addEventListener('DOMContentLoaded', resolve));
        }

        // If main api client exists, sync from it when it initializes
        if (window.api && api.initPromise) {
            try {
                await api.initPromise;
                // prefer api.currentUser/token when present
                if (api.currentUser) this.currentUser = api.currentUser;
                if (api.token) this.token = api.token;
            } catch (e) {
                // ignore
            }
        }

        // Keep in sync with other windows/tabs
        window.addEventListener('storage', (e) => {
            if (!e.key) return;
            if (e.key === 'cousinsvault_token') {
                this.token = e.newValue;
            }
            if (e.key === 'cousinsvault_session') {
                try {
                    this.currentUser = e.newValue ? JSON.parse(e.newValue).user : null;
                    // If token not set, try to hydrate from session
                    if (!this.token && e.newValue) {
                        const sessionObj = JSON.parse(e.newValue);
                        if (sessionObj && sessionObj.token) this.token = sessionObj.token;
                    }
                } catch (err) {
                    // ignore
                }
            }
        });

        return true;
    }

    _readStoredToken() {
        try {
            const t = localStorage.getItem('cousinsvault_token');
            if (t) return t;
        } catch (e) {}

        // fallback to session object
        try {
            const s = localStorage.getItem('cousinsvault_session');
            if (s) {
                const obj = JSON.parse(s);
                if (obj && obj.token) return obj.token;
            }
        } catch (e) {}

        return null;
    }

    _readStoredUser() {
        try {
            const s = localStorage.getItem('cousinsvault_session');
            if (s) {
                const obj = JSON.parse(s);
                return obj.user || null;
            }
        } catch (e) {}
        return null;
    }

    _headers(extra = {}) {
        const h = { ...extra };
        if (this.token) h['Authorization'] = `Bearer ${this.token}`;
        return h;
    }

    async _fetchJson(url, options = {}) {
        const cfg = { ...options };
        if (!cfg.headers) cfg.headers = {};
        try {
            const res = await fetch(url, cfg);
            const data = await res.json();
            if (!res.ok) {
                const err = new Error(data && data.error ? data.error : `HTTP ${res.status}`);
                err.response = res;
                err.data = data;
                throw err;
            }
            return data;
        } catch (err) {
            throw err;
        }
    }

    // Public methods

    async getEvents(params = {}) {
        // Try full API first (if token available), else try simple endpoint
        const qs = new URLSearchParams(params).toString();
        const listUrl = `/api/v1/events?action=list${qs ? '&' + qs : ''}`;
        const simpleUrl = '/api/v1/events_simple.php';

        // If token exists, try full
        if (this.token) {
            try {
                const data = await this._fetchJson(this.baseURL + listUrl, { headers: this._headers() });
                // Normalize to { success:true, data:{ events: [...] } }
                if (data && data.events) return { success: true, data: { events: data.events } };
                if (data && data.data && data.data.events) return data;
                return { success: true, data: { events: data.data && data.data.events ? data.data.events : data.events || [] } };
            } catch (err) {
                console.warn('eventsApi: full events API failed, falling back to simple:', err.message || err);
                // fall through
            }
        }

        // Try simple endpoint
        try {
            const data = await this._fetchJson(this.baseURL + simpleUrl, { headers: { 'Content-Type': 'application/json' } });
            // simple endpoint returns { success:true, data: [ ... ] }
            if (data && data.success && Array.isArray(data.data)) {
                return { success: true, data: { events: data.data } };
            }
            return data;
        } catch (err) {
            console.error('eventsApi: simple endpoint failed:', err);
            throw err;
        }
    }

    async getUpcoming(limit = 5) {
        try {
            // prefer full API
            if (this.token) {
                const res = await this._fetchJson(this.baseURL + `/api/v1/events?action=upcoming&limit=${limit}`, { headers: this._headers() });
                if (res && res.events) return { success: true, data: { events: res.events } };
                if (res && res.data && res.data.events) return res;
            }
        } catch (err) {
            console.warn('eventsApi: full upcoming failed, falling back to simple');
        }

        // fallback: get from simple and sort on client
        try {
            const res = await this._fetchJson(this.baseURL + '/api/v1/events_simple.php');
            if (res && res.success && Array.isArray(res.data)) {
                const upcoming = res.data.filter(e => new Date(e.event_date) >= new Date()).sort((a,b) => new Date(a.event_date) - new Date(b.event_date)).slice(0, limit);
                return { success: true, data: { events: upcoming } };
            }
            return res;
        } catch (err) {
            throw err;
        }
    }

    async createEvent(payload = {}) {
        // prefer full API create when available
        if (this.token) {
            try {
                const res = await this._fetchJson(this.baseURL + '/api/v1/events?action=create', {
                    method: 'POST',
                    headers: this._headers({ 'Content-Type': 'application/json' }),
                    body: JSON.stringify(payload)
                });
                return res;
            } catch (err) {
                console.warn('eventsApi.createEvent: full API failed, falling back to simple:', err.message || err);
            }
        }

        // fallback to simple events endpoint
        try {
            const simpleRes = await this._fetchJson(this.baseURL + '/api/v1/events_simple.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: payload.title,
                    description: payload.description,
                    event_date: payload.event_date,
                    event_time: payload.event_time || null,
                    event_type: payload.event_type,
                    location: payload.location,
                    creator_name: (this.currentUser && (this.currentUser.name || this.currentUser.username)) ? (this.currentUser.name || this.currentUser.username) : (payload.creator_name || 'Anonymous')
                })
            });
            return simpleRes;
        } catch (err) {
            throw err;
        }
    }

    async submitRSVP(payload = {}) {
        // Try full API if token exists
        if (this.token) {
            try {
                const res = await this._fetchJson(this.baseURL + '/api/v1/events?action=rsvp', {
                    method: 'POST',
                    headers: this._headers({ 'Content-Type': 'application/json' }),
                    body: JSON.stringify(payload)
                });
                return res;
            } catch (err) {
                console.warn('eventsApi.submitRSVP: full API failed:', err.message || err);
            }
        }

        // Fallback: store RSVP locally so user doesn't lose their choice
        try {
            const stored = localStorage.getItem('userRSVPs');
            const rsvps = stored ? JSON.parse(stored) : {};
            rsvps[payload.event_id] = payload.rsvp_status;
            localStorage.setItem('userRSVPs', JSON.stringify(rsvps));
            return { success: true, data: { event_id: payload.event_id, rsvp_status: payload.rsvp_status }, message: 'Saved locally' };
        } catch (err) {
            throw err;
        }
    }
}

// instantiate and expose
window.eventsApi = new EventsAPIClient();
