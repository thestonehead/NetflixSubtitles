const ejs = require('ejs');
const CopyPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');
var MiniCssExtractPlugin = require('mini-css-extract-plugin');
const version = '1.0.0';
// vue.config.js
module.exports = {
    configureWebpack: config => {
        delete config.entry.app
        config.optimization.splitChunks = false;
        config.devtool = "inline-source-map";
        return {
            output: {
                filename: "[id].js"
            },
            entry: {
                'background': './src/background/background.ts',
                'popup/popup': './src/popup/popup.js',
                'options/options': './src/options/options.js',
                'content-netflix': ['./src/content/netflixHandler.ts', './src/content/netflixMetadataInterceptor.ts'],
                'content-OpenSubtitles': ['./src/content/openSubtitlesHandler.ts'],
                'content-PodnapisiNet': ['./src/content/podnapisiNetHandler.ts']
            },
            plugins: [
                new CopyPlugin([
                    { from: 'src/icons', to: 'icons', ignore: ['icon.xcf'] },
                    { from: 'src/popup/popup.html', to: 'popup/popup.html', transform: transformHtml },
                    { from: 'src/options/options.html', to: 'options/options.html', transform: transformHtml },
                    { from: 'src/background/background.html', to: 'background.html', transform: transformHtml },
                    { from: 'src/background/libs', to: 'libs' },
                    {
                        from: 'src/manifest.json',
                        to: 'manifest.json',
                        transform: (content) => {
                            const jsonContent = JSON.parse(content);
                            jsonContent.version = version;

                            if (config.mode === 'development') {
                                jsonContent['content_security_policy'] = "script-src 'self' 'unsafe-eval'; object-src 'self'";
                            }

                            return JSON.stringify(jsonContent, null, 2);
                        },
                    },
                ]),
                new MiniCssExtractPlugin({
                    filename: '[id].css'
                })
            ]
        }
    }
}

function transformHtml(content) {
    return ejs.render(content.toString(), {
        ...process.env,
    });
}