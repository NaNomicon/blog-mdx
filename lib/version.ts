import packageJson from '../package.json';

export const getVersion = (): string => {
    return packageJson.version;
};

export const getVersionInfo = () => {
    return {
        version: packageJson.version,
        name: packageJson.name,
    };
}; 