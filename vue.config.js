const ejs = require('ejs');
const CopyPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');
var MiniCssExtractPlugin = require('mini-css-extract-plugin');
const fs = require('fs');



const version = '1.0.0';
// vue.config.js
module.exports = {
    configureWebpack: config => {
        delete config.entry.app
        config.optimization.splitChunks = false;
        config.devtool = "inline-source-map";

        const entries = {
            'background': './src/background/background.ts',
            'popup/popup': './src/popup/popup.js',
            'options/options': './src/options/options.js',
            'content-netflix': ['./src/content/netflixHandler.ts', './src/content/netflixMetadataInterceptor.ts'],
            //HANDLERS-HERE
        };



        const files = fs.readdirSync("./src/sources");
        files.forEach(file => {
            if (file.indexOf(".") > -1) return;
            let subfiles = fs.readdirSync("./src/sources/" + file);
            if (subfiles.indexOf(file + "Handler.ts") > -1) {
                entries["content-" + file] = [`./src/sources/${file}/${file}Handler.ts`];
                //console.log("File1:" + JSON.stringify(entries));
            }
        });

        console.log(entries);

        return {
            output: {
                filename: "[id].js"
            },
            /*  entry: {
                  'background': './src/background/background.ts',
                  'popup/popup': './src/popup/popup.js',
                  'options/options': './src/options/options.js',
                  'content-netflix': ['./src/content/netflixHandler.ts', './src/content/netflixMetadataInterceptor.ts'],
                  'content-OpenSubtitles': ['./src/content/openSubtitlesHandler.ts'],
                  'content-PodnapisiNet': ['./src/content/podnapisiNetHandler.ts']
              },*/
            entry: entries,
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
