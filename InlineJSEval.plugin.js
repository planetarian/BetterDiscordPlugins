/**
 * @name InlineJSEval
 * @description Execute raw JavaScript straight from the chatbox with `eval(...)`
 * @version 0.1.1
 * @author Chami
 * @authorId 165709167095578625
 * @website https://github.com/planetarian/BetterDiscordPlugins
 * @source https://raw.githubusercontent.com/planetarian/BetterDiscordPlugins/master/InlineJSEval.plugin.js
 */
/*@cc_on
@if (@_jscript)
    
    // Offer to self-install for clueless users that try to run this directly.
    var shell = WScript.CreateObject("WScript.Shell");
    var fs = new ActiveXObject("Scripting.FileSystemObject");
    var pathPlugins = shell.ExpandEnvironmentStrings("%APPDATA%\\BetterDiscord\\plugins");
    var pathSelf = WScript.ScriptFullName;
    // Put the user at ease by addressing them in the first person
    shell.Popup("It looks like you've mistakenly tried to run me directly. \n(Don't do that!)", 0, "I'm a plugin for BetterDiscord", 0x30);
    if (fs.GetParentFolderName(pathSelf) === fs.GetAbsolutePathName(pathPlugins)) {
        shell.Popup("I'm in the correct folder already.", 0, "I'm already installed", 0x40);
    } else if (!fs.FolderExists(pathPlugins)) {
        shell.Popup("I can't find the BetterDiscord plugins folder.\nAre you sure it's even installed?", 0, "Can't install myself", 0x10);
    } else if (shell.Popup("Should I copy myself to BetterDiscord's plugins folder for you?", 0, "Do you need some help?", 0x34) === 6) {
        fs.CopyFile(pathSelf, fs.BuildPath(pathPlugins, fs.GetFileName(pathSelf)), true);
        // Show the user where to put plugins in the future
        shell.Exec("explorer " + pathPlugins);
        shell.Popup("I'm installed!", 0, "Successfully installed", 0x40);
    }
    WScript.Quit();

@else@*/
const config = {
    info: {
        name: "InlineJSEval",
        authors: [
            {
                name: "Chami",
                discord_id: "165709167095578625",
                github_username: "planetarian",
                twitter_username: "pir0zhki"
            }
        ],
        version: "0.1.1",
        description: "Execute raw JavaScript straight from the chatbox with `eval(...)`",
        github: "https://github.com/planetarian/BetterDiscordPlugins",
        github_raw: "https://raw.githubusercontent.com/planetarian/BetterDiscordPlugins/master/InlineJSEval.plugin.js"
    },
    changelog: [
        {
            title: "0.1.1",
            items: [
                "Rebuilt with updated toolset"
            ]
        },
        {
            title: "0.1.0",
            items: [
                "Switched to new plugin format",
                "Switched to new ZeresLib"
            ]
        }
    ],
    main: "index.js"
};
class Dummy {
    constructor() {this._config = config;}
    start() {}
    stop() {}
}
 
if (!global.ZeresPluginLibrary) {
    BdApi.showConfirmationModal("Library Missing", `The library plugin needed for ${config.name ?? config.info.name} is missing. Please click Download Now to install it.`, {
        confirmText: "Download Now",
        cancelText: "Cancel",
        onConfirm: () => {
            require("request").get("https://betterdiscord.app/gh-redirect?id=9", async (err, resp, body) => {
                if (err) return require("electron").shell.openExternal("https://betterdiscord.app/Download?id=9");
                if (resp.statusCode === 302) {
                    require("request").get(resp.headers.location, async (error, response, content) => {
                        if (error) return require("electron").shell.openExternal("https://betterdiscord.app/Download?id=9");
                        await new Promise(r => require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), content, r));
                    });
                }
                else {
                    await new Promise(r => require("fs").writeFile(require("path").join(BdApi.Plugins.folder, "0PluginLibrary.plugin.js"), body, r));
                }
            });
        }
    });
}
 
module.exports = !global.ZeresPluginLibrary ? Dummy : (([Plugin, Api]) => {
     const plugin = (Plugin, Library) => {

    const { Logger, DiscordModules, Patcher, Settings } = Library;

    return class InlineJSEval extends Plugin {
        constructor() {
            super();
            this.defaultSettings = {

            };
        }

        onStart() {
            Logger.log("Started");

            Patcher.before(DiscordModules.MessageActions, "sendMessage", (t,a) => {
                let content = a[1].content;

                const regex = new RegExp("someRegex");
                if (regex.test(content)) {
                    if (content.length > 2000) {
                        PluginUtilities.showToast("This message would exceed the 2000-character limit.\nReduce corruption amount or shorten text.\n\nLength including corruption: " + value.length, {type: 'error'});
                        e.preventDefault();
                        return;
                    }
                    a[1].content = content;
                }
            });

            this.update();
        }

        onStop() {
            Patcher.unpatchAll();
            Logger.log("Stopped");
        }

        getSettingsPanel() {
            return "<h3>" + this.getName() + " Settings</h3>";
            //return Settings.SettingPanel.build(this.saveSettings.bind(this), ...)
        }

        update () {
            this.initialized = true;
        }
    };
};
     return plugin(Plugin, Api);
})(global.ZeresPluginLibrary.buildPlugin(config));
/*@end@*/