class API {
    createGame(gid, size, ships) {
        const p = [['gid', gid], ['size', size], ['ships', ships]].reduce((acc, [k, v]) => {
            if (v) {
                acc[k] = v;
            }
            return acc;
        }, {});

        return axios.get(`/api/game/create`, {
            params: p,
        });
    }

    joinGame(gid) {
        return axios.get(`/api/game/join`, {
            params: {
                gid,
            },
        });
    }

    game(gid, pid) {
        return axios.get(`/api/game`, {
            params: {
                gid,
                pid,
            },
        });
    }

    set(gid, pid, ships) {
        return axios.post(`/api/set`, ships, {
            params: {
                gid,
                pid,
            },
        });
    }

    check(gid, pid, location) {
        return axios.post(`/api/check`, location, {
            params: {
                gid,
                pid,
            },
        });
    }

    resign(gid, pid) {
        return axios.post(`/api/resign`, null, {
            params: {
                gid,
                pid,
            },
        });
    }

    rematch(gid, pid, location) {
        return axios.post(`/api/rematch`, null, {
            params: {
                gid,
                pid,
            },
        });
    }
}