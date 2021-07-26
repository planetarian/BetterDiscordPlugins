//META{"name":"TwitFixer","displayName":"TwitFixer","website":"https://github.com/planetarian/BetterDiscordPlugins","source":"https://raw.githubusercontent.com/planetarian/BetterDiscordPlugins/master/TwitFixer.plugin.js"}*//
/*@cc_on
@if (@_jscript)
	
	// Offer to self-install for clueless users that try to run this directly.
	var shell = WScript.CreateObject("WScript.Shell");
	var fs = new ActiveXObject("Scripting.FileSystemObject");
	var pathPlugins = shell.ExpandEnvironmentStrings("%APPDATA%\BetterDiscord\plugins");
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

var TwitFixer = (() => {
    const config = {"info":{"name":"TwitFixer","authors":[{"name":"Chami","discord_id":"165709167095578625","github_username":"planetarian","twitter_username":"pir0zhki"}],"version":"0.0.1","description":"Automatically replaces links to twitter with links using fxtwitter.com","github":"https://github.com/planetarian/BetterDiscordPlugins","github_raw":"https://raw.githubusercontent.com/planetarian/BetterDiscordPlugins/master/TwitFixer.plugin.js"},"changelog":[{"title":"0.0.1","items":["Initial version"]}],"main":"index.js"};

    return !global.ZeresPluginLibrary ? class {
        constructor() {this._config = config;}
        getName() {return config.info.name;}
        getAuthor() {return config.info.authors.map(a => a.name).join(", ");}
        getDescription() {return config.info.description;}
        getVersion() {return config.info.version;}
        load() {
            const title = "Library Missing";
            const ModalStack = BdApi.findModuleByProps("push", "update", "pop", "popWithKey");
            const TextElement = BdApi.findModuleByProps("Sizes", "Weights");
            const ConfirmationModal = BdApi.findModule(m => m.defaultProps && m.key && m.key() == "confirm-modal");
            if (!ModalStack || !ConfirmationModal || !TextElement) return BdApi.alert(title, `The library plugin needed for ${config.info.name} is missing.<br /><br /> <a href="https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js" target="_blank">Click here to download the library!</a>`);
            ModalStack.push(function(props) {
                return BdApi.React.createElement(ConfirmationModal, Object.assign({
                    header: title,
                    children: [BdApi.React.createElement(TextElement, {color: TextElement.Colors.PRIMARY, children: [`The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`]})],
                    red: false,
                    confirmText: "Download Now",
                    cancelText: "Cancel",
                    onConfirm: () => {
                        require("request").get("https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js", async (error, response, body) => {
                            if (error) return require("electron").shell.openExternal("https://betterdiscord.net/ghdl?url=https://raw.githubusercontent.com/rauenzi/BDPluginLibrary/master/release/0PluginLibrary.plugin.js");
                            await new Promise(r => require("fs").writeFile(require("path").join(ContentManager.pluginsFolder, "0PluginLibrary.plugin.js"), body, r));
                        });
                    }
                }, props));
            });
        }
        start() {}
        stop() {}
    } : (([Plugin, Api]) => {
        const plugin = (Plugin, Library) => {

    const { Logger, DiscordModules, Patcher, Settings } = Library;

    return class TwitFixer extends Plugin {
        constructor() {
            super();

            this.defaultSettings = {};
        }

        onStart() {
            Logger.log("Started");
            
            Patcher.before(DiscordModules.MessageActions, "sendMessage", (t,a) => {
                let content = a[1].content;
                let regex = /https?:\/\/twitter.com\//g;
                let replace = 'https://fxtwitter.com/';
                if (regex.test(content)) {
                    content = content.replace(regex, replace);
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
            /// Using patch method for now
            Patcher.unpatchAll();
            Logger.log("Stopped");
        }
        
        update() {
            this.initialized = true;
        }
    };

};
        return plugin(Plugin, Api);
    })(global.ZeresPluginLibrary.buildPlugin(config));
})();
/*@end@*/