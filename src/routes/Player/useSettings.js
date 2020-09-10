// Copyright (C) 2017-2020 Smart code 203358507

const React = require('react');
const { useServices } = require('stremio/services');

const useSettings = (profile) => {
    const { core } = useServices();
    const updateSettings = React.useCallback((settings) => {
        core.transport.dispatch({
            action: 'Ctx',
            args: {
                action: 'UpdateSettings',
                args: {
                    ...profile.settings,
                    ...settings
                }
            }
        });
    }, [profile]);
    return [profile.settings, updateSettings];
};

module.exports = useSettings;
