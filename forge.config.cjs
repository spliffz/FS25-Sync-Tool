module.exports = {
  packagerConfig: {
    ignore: [
      /^\/src/,
      /(.eslintrc.json)|(.gitignore)|(electron.vite.config.ts)|(forge.config.cjs)|(tsconfig.*)/,
    ],
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {},
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {},
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {},
    },
  ],
  publishers: [
    {
      name: '@electron-forge/publisher-github',
      config: {
        repository: {
          owner: 'Spliffz',
          name: 'fs25-sync-tool'
        },
        prerelease: true,
        authToken: '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'
      }
    }
  ]
};