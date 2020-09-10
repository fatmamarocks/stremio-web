// Copyright (C) 2017-2020 Smart code 203358507

const React = require('react');
const PropTypes = require('prop-types');
const classnames = require('classnames');
const Icon = require('@stremio/stremio-icons/dom');
const { Modal, useRouteFocused } = require('stremio-router');
const { useServices } = require('stremio/services');
const { Button, Image, useBinaryState } = require('stremio/common');
const CredentialsTextInput = require('./CredentialsTextInput');
const ConsentCheckbox = require('./ConsentCheckbox');
const PasswordResetModal = require('./PasswordResetModal');
const styles = require('./styles');

const SIGNUP_FORM = 'signup';
const LOGIN_FORM = 'login';

const Intro = ({ queryParams }) => {
    const { core } = useServices();
    const routeFocused = useRouteFocused();
    const emailRef = React.useRef(null);
    const passwordRef = React.useRef(null);
    const confirmPasswordRef = React.useRef(null);
    const termsRef = React.useRef(null);
    const privacyPolicyRef = React.useRef(null);
    const marketingRef = React.useRef(null);
    const errorRef = React.useRef(null);
    const [passwordRestModalOpen, openPasswordRestModal, closePasswordResetModal] = useBinaryState(false);
    const [loaderModalOpen, openLoaderModal, closeLoaderModal] = useBinaryState(false);
    const [state, dispatch] = React.useReducer(
        (state, action) => {
            switch (action.type) {
                case 'set-form':
                    if (state.form !== action.form) {
                        return {
                            form: action.form,
                            email: '',
                            password: '',
                            confirmPassword: '',
                            termsAccepted: false,
                            privacyPolicyAccepted: false,
                            marketingAccepted: false,
                            error: ''
                        };
                    }
                    return state;
                case 'change-credentials':
                    return {
                        ...state,
                        error: '',
                        [action.name]: action.value
                    };
                case 'toggle-checkbox':
                    return {
                        ...state,
                        error: '',
                        [action.name]: !state[action.name]
                    };
                case 'error':
                    return {
                        ...state,
                        error: action.error
                    };
                default:
                    return state;
            }
        },
        {
            form: [LOGIN_FORM, SIGNUP_FORM].includes(queryParams.get('form')) ? queryParams.get('form') : SIGNUP_FORM,
            email: '',
            password: '',
            confirmPassword: '',
            termsAccepted: false,
            privacyPolicyAccepted: false,
            marketingAccepted: false,
            error: ''
        }
    );
    const loginWithFacebook = React.useCallback(() => {
        if (typeof FB !== 'undefined') {
            FB.login((response) => {
                if (response.status === 'connected') {
                    fetch('https://www.strem.io/fb-login-with-token/' + encodeURIComponent(response.authResponse.accessToken), { timeout: 10 * 60 * 1000 })
                        .then((resp) => {
                            if (resp.status < 200 || resp.status >= 300) {
                                throw new Error('Login failed at getting token from Stremio with status ' + resp.status);
                            } else {
                                return resp.json();
                            }
                        })
                        .then(({ user }) => {
                            if (!user || typeof user.fbLoginToken !== 'string' || typeof user.email !== 'string') {
                                throw new Error('Login failed at getting token from Stremio');
                            }
                            core.transport.dispatch({
                                action: 'Ctx',
                                args: {
                                    action: 'Authenticate',
                                    args: {
                                        type: 'Login',
                                        email: user.email,
                                        password: user.fbLoginToken
                                    }
                                }
                            });
                        })
                        .catch((err = {}) => {
                            dispatch({ type: 'error', error: err.message || JSON.stringify(err) });
                        });
                } else {
                    dispatch({ type: 'error', error: 'Login failed at getting token from Facebook' });
                }
            });
        }
    }, []);
    const loginWithEmail = React.useCallback(() => {
        if (typeof state.email !== 'string' || state.email.length === 0 || !emailRef.current.validity.valid) {
            dispatch({ type: 'error', error: 'Invalid email' });
            return;
        }
        if (typeof state.password !== 'string' || state.password.length === 0) {
            dispatch({ type: 'error', error: 'Invalid password' });
            return;
        }
        openLoaderModal();
        core.transport.dispatch({
            action: 'Ctx',
            args: {
                action: 'Authenticate',
                args: {
                    type: 'Login',
                    email: state.email,
                    password: state.password
                }
            }
        });
    }, [state.email, state.password]);
    const loginAsGuest = React.useCallback(() => {
        if (!state.termsAccepted) {
            dispatch({ type: 'error', error: 'You must accept the Terms of Service' });
            return;
        }
        core.transport.dispatch({
            action: 'Ctx',
            args: {
                action: 'Logout'
            }
        });
        window.location = '#/';
    }, [state.termsAccepted]);
    const signup = React.useCallback(() => {
        if (typeof state.email !== 'string' || state.email.length === 0 || !emailRef.current.validity.valid) {
            dispatch({ type: 'error', error: 'Invalid email' });
            return;
        }
        if (typeof state.password !== 'string' || state.password.length === 0) {
            dispatch({ type: 'error', error: 'Invalid password' });
            return;
        }
        if (state.password !== state.confirmPassword) {
            dispatch({ type: 'error', error: 'Passwords do not match' });
            return;
        }
        if (!state.termsAccepted) {
            dispatch({ type: 'error', error: 'You must accept the Terms of Service' });
            return;
        }
        if (!state.privacyPolicyAccepted) {
            dispatch({ type: 'error', error: 'You must accept the Privacy Policy' });
            return;
        }
        openLoaderModal();
        core.transport.dispatch({
            action: 'Ctx',
            args: {
                action: 'Authenticate',
                args: {
                    type: 'Register',
                    email: state.email,
                    password: state.password,
                    gdpr_consent: {
                        tos: state.termsAccepted,
                        privacy: state.privacyPolicyAccepted,
                        marketing: state.marketingAccepted,
                        time: new Date(),
                        from: 'web'
                    }
                }
            }
        });
    }, [state.email, state.password, state.confirmPassword, state.termsAccepted, state.privacyPolicyAccepted, state.marketingAccepted]);
    const emailOnChange = React.useCallback((event) => {
        dispatch({
            type: 'change-credentials',
            name: 'email',
            value: event.currentTarget.value
        });
    }, []);
    const emailOnSubmit = React.useCallback(() => {
        passwordRef.current.focus();
    }, []);
    const passwordOnChange = React.useCallback((event) => {
        dispatch({
            type: 'change-credentials',
            name: 'password',
            value: event.currentTarget.value
        });
    }, []);
    const passwordOnSubmit = React.useCallback(() => {
        if (state.form === SIGNUP_FORM) {
            confirmPasswordRef.current.focus();
        } else {
            loginWithEmail();
        }
    }, [state.form, loginWithEmail]);
    const confirmPasswordOnChange = React.useCallback((event) => {
        dispatch({
            type: 'change-credentials',
            name: 'confirmPassword',
            value: event.currentTarget.value
        });
    }, []);
    const confirmPasswordOnSubmit = React.useCallback(() => {
        termsRef.current.focus();
    }, []);
    const toggleTermsAccepted = React.useCallback(() => {
        dispatch({ type: 'toggle-checkbox', name: 'termsAccepted' });
    }, []);
    const togglePrivacyPolicyAccepted = React.useCallback(() => {
        dispatch({ type: 'toggle-checkbox', name: 'privacyPolicyAccepted' });
    }, []);
    const toggleMarketingAccepted = React.useCallback(() => {
        dispatch({ type: 'toggle-checkbox', name: 'marketingAccepted' });
    }, []);
    const switchFormOnClick = React.useCallback(() => {
        const queryParams = new URLSearchParams([['form', state.form === SIGNUP_FORM ? LOGIN_FORM : SIGNUP_FORM]]);
        window.location = `#/intro?${queryParams.toString()}`;
    }, [state.form]);
    React.useEffect(() => {
        if ([LOGIN_FORM, SIGNUP_FORM].includes(queryParams.get('form'))) {
            dispatch({ type: 'set-form', form: queryParams.get('form') });
        }
    }, [queryParams]);
    React.useEffect(() => {
        if (routeFocused && typeof state.error === 'string' && state.error.length > 0) {
            errorRef.current.scrollIntoView();
        }
    }, [state.error]);
    React.useEffect(() => {
        if (routeFocused) {
            emailRef.current.focus();
        }
    }, [state.form, routeFocused]);
    React.useEffect(() => {
        const onEvent = ({ event, args }) => {
            switch (event) {
                case 'UserAuthenticated': {
                    closeLoaderModal();
                    window.location = '#/';
                    break;
                }
                case 'Error': {
                    if (args.source.event === 'UserAuthenticated') {
                        closeLoaderModal();
                        dispatch({ type: 'error', error: args.error.message });
                    }

                    break;
                }
            }
        };
        if (routeFocused) {
            core.transport.on('Event', onEvent);
        }
        return () => {
            core.transport.off('Event', onEvent);
        };
    }, [routeFocused]);
    React.useEffect(() => {
        window.fbAsyncInit = function() {
            FB.init({
                appId: '1537119779906825',
                autoLogAppEvents: false,
                xfbml: false,
                version: 'v2.5'
            });
        };
        const sdkScriptElement = document.createElement('script');
        sdkScriptElement.src = 'https://connect.facebook.net/en_US/sdk.js';
        sdkScriptElement.async = true;
        sdkScriptElement.defer = true;
        document.body.appendChild(sdkScriptElement);
        return () => {
            document.body.removeChild(sdkScriptElement);
        };
    }, []);
    return (
        <div className={styles['intro-container']}>
            <div className={styles['form-container']}>
                <div className={styles['logo-container']}>
                    <Image className={styles['logo']} src={'/images/stremio_symbol.png'} alt={' '} />
                    <Icon className={styles['name']} icon={'ic_stremio'} />
                </div>
                <Button className={classnames(styles['form-button'], styles['facebook-button'])} onClick={loginWithFacebook}>
                    <Icon className={styles['icon']} icon={'ic_facebook'} />
                    <div className={styles['label']}>Continue with Facebook</div>
                </Button>
                {
                    state.form === SIGNUP_FORM ?
                        <Button className={classnames(styles['form-button'], styles['login-form-button'])} onClick={switchFormOnClick}>
                            Already have an account?
                            {' '}
                            <span className={styles['login-label']}>LOG IN</span>
                        </Button>
                        :
                        null
                }
                <CredentialsTextInput
                    ref={emailRef}
                    className={styles['credentials-text-input']}
                    type={'email'}
                    placeholder={'Email'}
                    value={state.email}
                    onChange={emailOnChange}
                    onSubmit={emailOnSubmit}
                />
                <CredentialsTextInput
                    ref={passwordRef}
                    className={styles['credentials-text-input']}
                    type={'password'}
                    placeholder={'Password'}
                    value={state.password}
                    onChange={passwordOnChange}
                    onSubmit={passwordOnSubmit}
                />
                {
                    state.form === SIGNUP_FORM ?
                        <React.Fragment>
                            <CredentialsTextInput
                                ref={confirmPasswordRef}
                                className={styles['credentials-text-input']}
                                type={'password'}
                                placeholder={'Confirm Password'}
                                value={state.confirmPassword}
                                onChange={confirmPasswordOnChange}
                                onSubmit={confirmPasswordOnSubmit}
                            />
                            <ConsentCheckbox
                                ref={termsRef}
                                className={styles['consent-checkbox']}
                                label={'I have read and agree with the Stremio'}
                                link={'Terms and conditions'}
                                href={'https://www.stremio.com/tos'}
                                checked={state.termsAccepted}
                                onToggle={toggleTermsAccepted}
                            />
                            <ConsentCheckbox
                                ref={privacyPolicyRef}
                                className={styles['consent-checkbox']}
                                label={'I have read and agree with the Stremio'}
                                link={'Privacy Policy'}
                                href={'https://www.stremio.com/privacy'}
                                checked={state.privacyPolicyAccepted}
                                onToggle={togglePrivacyPolicyAccepted}
                            />
                            <ConsentCheckbox
                                ref={marketingRef}
                                className={styles['consent-checkbox']}
                                label={'I agree to receive marketing communications from Stremio'}
                                checked={state.marketingAccepted}
                                onToggle={toggleMarketingAccepted}
                            />
                        </React.Fragment>
                        :
                        <div className={styles['forgot-password-link-container']}>
                            <Button className={styles['forgot-password-link']} onClick={openPasswordRestModal}>Forgot password?</Button>
                        </div>
                }
                {
                    state.error.length > 0 ?
                        <div ref={errorRef} className={styles['error-message']}>{state.error}</div>
                        :
                        null
                }
                <Button className={classnames(styles['form-button'], styles['submit-button'])} onClick={state.form === SIGNUP_FORM ? signup : loginWithEmail}>
                    <div className={styles['label']}>{state.form === SIGNUP_FORM ? 'Sign up' : 'Log in'}</div>
                </Button>
                {
                    state.form === SIGNUP_FORM ?
                        <Button className={classnames(styles['form-button'], styles['guest-login-button'])} onClick={loginAsGuest}>
                            <div className={styles['label']}>GUEST LOGIN</div>
                        </Button>
                        :
                        null
                }
                {
                    state.form === LOGIN_FORM ?
                        <Button className={classnames(styles['form-button'], styles['signup-form-button'])} onClick={switchFormOnClick}>
                            <div className={styles['label']}>SIGN UP WITH EMAIL</div>
                        </Button>
                        :
                        null
                }
            </div>
            {
                passwordRestModalOpen ?
                    <PasswordResetModal email={state.email} onCloseRequest={closePasswordResetModal} />
                    :
                    null
            }
            {
                loaderModalOpen ?
                    <Modal className={styles['loading-modal-container']}>
                        <div className={styles['loader-container']}>
                            <Icon className={styles['icon']} icon={'ic_user'} />
                            <div className={styles['label']}>Authenticating...</div>
                        </div>
                    </Modal>
                    :
                    null
            }
        </div>
    );
};

Intro.propTypes = {
    queryParams: PropTypes.instanceOf(URLSearchParams)
};

module.exports = Intro;
