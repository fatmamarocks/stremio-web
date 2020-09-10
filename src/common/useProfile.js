// Copyright (C) 2017-2020 Smart code 203358507

const React = require('react');
const { useServices } = require('stremio/services');
const useModelState = require('stremio/common/useModelState');

const mapProfileState = (ctx) => {
    return ctx.profile;
};

const useProfile = () => {
    const { core } = useServices();
    const initProfileState = React.useCallback(() => {
        const ctx = core.transport.getState('ctx');
        return mapProfileState(ctx);
    }, []);
    const profile = useModelState({
        model: 'ctx',
        init: initProfileState,
        map: mapProfileState
    });
    return profile;
};

module.exports = useProfile;
