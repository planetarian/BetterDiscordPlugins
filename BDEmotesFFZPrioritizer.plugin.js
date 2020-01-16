//META{"name":"BDEmotesFFZPrioritizer","displayName":"BDEmotesFFZPrioritizer","website":"https://github.com/planetarian/BetterDiscordPlugins","source":"https://raw.githubusercontent.com/planetarian/BetterDiscordPlugins/master/BDEmotesFFZPrioritizer.plugin.js"}*//
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

var BDEmotesFFZPrioritizer = (() => {
    const config = {"info":{"name":"BDEmotesFFZPrioritizer","authors":[{"name":"Chami","discord_id":"165709167095578625","github_username":"planetarian","twitter_username":"pir0zhki"}],"version":"0.1.1","description":"Ensures that FFZ emotes have priority over the objectively inferior BTTV emotes. Get your Klappa on.","github":"https://github.com/planetarian/BetterDiscordPlugins","github_raw":"https://raw.githubusercontent.com/planetarian/BetterDiscordPlugins/master/BDEmotesFFZPrioritizer.plugin.js"},"changelog":[{"title":"0.1.1","items":["Fixed priority order"]},{"title":"0.1.0","items":["Moved to new BD plugin format"]}],"main":"index.js"};

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
                    children: [TextElement({color: TextElement.Colors.PRIMARY, children: [`The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`]})],
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

    const { Logger, Patcher, Settings } = Library;    

    return class BDEmotesFFZPrioritizer extends Plugin {
        constructor() {
            super();
        }

        onStart() {
            Logger.log("Started");
            setTimeout(() => this.fixEmotes(), 3000);
        }

        onStop() {
            this.fixEmotes(false);
            Patcher.unpatchAll();
            Logger.log("Stopped");
        }

        onSwitch() {
            this.fixEmotes();
        }

        setEmotes() {
            if (!window.bdEmotes.FrankerFaceZ)
                return false;

            this.normalEmotes = {
                twitch: window.bdEmotes.TwitchGlobal,
                twitchSub: window.bdEmotes.TwitchSubscriber,
                bttv: window.bdEmotes.BTTV,
                bttv2: window.bdEmotes.BTTV2,
                ffz: window.bdEmotes.FrankerFaceZ
            };
    
            this.swappedEmotes = {
                twitch: window.bdEmotes.FrankerFaceZ,
                twitchSub: window.bdEmotes.TwitchSubscriber,
                bttv: window.bdEmotes.BTTV,
                bttv2: window.bdEmotes.BTTV2,
                ffz: window.bdEmotes.TwitchGlobal
            };
            
            return true;
        }

        // doFix: true to swap the repos, false to put them back to default
        fixEmotes(doFix = true) {
            if (!this.setEmotes() || !this.normalEmotes || !this.swappedEmotes)
                return;

            let ffz = window.bdEmotes.FrankerFaceZ;
            if (ffz && ffz.Klappa && ffz.Klappa.startsWith('https://cdn.frankerfacez.com/') == doFix) {
                var emotes = doFix ? this.swappedEmotes : this.normalEmotes;

                window.bdEmotes.TwitchGlobal = emotes.twitch;
                window.bdEmotes.TwitchSubscriber = emotes.twitchSub;
                window.bdEmotes.BTTV = emotes.bttv;
                window.bdEmotes.BTTV2 = emotes.bttv2;
                window.bdEmotes.FrankerFaceZ = emotes.ffz;

                Logger.log("Emotes swapped" + (doFix ? "." : " back."));
            }
        }
    };

};
        return plugin(Plugin, Api);
    })(global.ZeresPluginLibrary.buildPlugin(config));
})();
/*@end@*/
