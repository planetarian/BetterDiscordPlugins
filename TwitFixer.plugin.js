/**
 * @name TwitFixer
 * @description Automatically replace twitter.com and x.com links with fxtwitter.com
 * @version 0.1.0
 * @author Chami
 * @authorId 165709167095578625
 * @website https://github.com/planetarian/BetterDiscordPlugins
 * @source https://raw.githubusercontent.com/planetarian/BetterDiscordPlugins/master/TwitFixer.plugin.js
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
        name: "TwitFixer",
        authors: [
            {
                name: "Chami",
                discord_id: "165709167095578625",
                github_username: "planetarian",
                twitter_username: "pir0zhki"
            }
        ],
        version: "0.1.0",
        description: "Automatically replace twitter.com and x.com links with fxtwitter.com",
        github: "https://github.com/planetarian/BetterDiscordPlugins",
        github_raw: "https://raw.githubusercontent.com/planetarian/BetterDiscordPlugins/master/TwitFixer.plugin.js"
    },
    changelog: [
        {
            title: "0.1.0",
            items: [
                "Changed to fxtwitter with /en"
            ]
        },
        {
            title: "0.0.5",
            items: [
                "Rebuilt with updated toolset"
            ]
        },
        {
            title: "0.0.4",
            items: [
                "Inverted Ctrl mode. Will now transform to vx by default, and hold Ctrl to bypass."
            ]
        },
        {
            title: "0.0.3",
            items: [
                "Hold Ctrl to apply transform"
            ]
        },
        {
            title: "0.0.2",
            items: [
                "FX->VX"
            ]
        },
        {
            title: "0.0.1",
            items: [
                "Initial version"
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

    return class Twithisixer extends Plugin {
        modifierDown = false;

        constructor() {
            super();

            this.defaultSettings = {};
        }

        onStart() {
            Logger.log("Started");

            Patcher.before(DiscordModules.MessageActions, "sendMessage", (t,a) => {
                let content = a[1].content;
                
                let regex = /(?<pre>https?:\/\/)(?:x|(?:(?:v|f)x)?twitter)\.com(?<post>\/\w+\/status\/\d+(?:\/photo(?:\/(?<photonum>\d+)?)?)?)(?:\/en)*(?<query>(?:\?$|[a-zA-Z0-9\.\,\;\?\'\\\+&%\$\=~_\-\*]+))?(?<fragment>#[a-zA-Z0-9\-\.]+)?/gi;
                if (!this.modifierDown && regex.test(content)) {
                    const replace = (match, pre, post, photonum, query, fragment, rest) => pre + "fxtwitter.com" + post + "/en";
                    content = content.replace(regex, replace);
                    if (content.length > 2000) {
                        PluginUtilities.showToast("This message would exceed the 2000-character limit.\r\nTotal Length: " + value.length, {type: 'error'});
                        e.preventDefault();
                        return;
                    }
                    a[1].content = content;
                }
            });
            
            document.addEventListener('keydown', this.checkKey.bind(this));
            document.addEventListener('keyup', this.checkKey.bind(this));

            this.update();
        }

        onStop() {
            document.removeEventListener('keydown', this.checkKey.bind(this));
            document.removeEventListener('keyup', this.checkKey.bind(this));

            /// Using patch method for now
            Patcher.unpatchAll();
            Logger.log("Stopped");
        }
        
        update() {
            this.initialized = true;
        }
        
        checkKey(ev) {
            if (this.modifierDown != ev.ctrlKey)
                this.modifierDown = ev.ctrlKey;
        }
    };

};
     return plugin(Plugin, Api);
})(global.ZeresPluginLibrary.buildPlugin(config));
/*@end@*/