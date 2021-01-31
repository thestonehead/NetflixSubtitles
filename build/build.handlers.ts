
module.exports = (api, options) => {
    const { build } = api.service.commands;
    const buildFn = build.fn;

    api.registerCommand('build:handlers', async (args) => {
        const fs = require('fs');
        var result = new Promise((resolve, reject) => {
            let entries = {};
            fs.readdir("./src/sources", (err, files) => {
                files.forEach(file => {
                    if (file.indexOf(".") > -1) return;
                    fs.readdir("./src/sources/" + file, (err, subfiles) => {
                        if (subfiles.indexOf(file + "Handler.ts") > -1) {
                            entries["content-" + file] = [`./src/content/${file}Handler.ts`];
                            //console.log("File1:" + JSON.stringify(entries));

                            
                        }
                        resolve(entries)
                    }); 
                });
            });
        });

        args.entries = await result;
        console.log(args);
        await api.service.run('build', args);
    })
}

module.exports.defaultModes = {
    'build:handlers': 'production'
}