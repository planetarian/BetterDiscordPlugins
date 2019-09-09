//META{"name":"WhoAreYou","displayName":"WhoAreYou","website":"https://github.com/planetarian/BetterDiscordPlugins","source":"https://raw.githubusercontent.com/planetarian/BetterDiscordPlugins/master/WhoAreYou.plugin.js"}*//
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

var WhoAreYou = (() => {
    const config = {"info":{"name":"WhoAreYou","authors":[{"name":"Chami","discord_id":"165709167095578625","github_username":"planetarian","twitter_username":"pir0zhki"}],"version":"0.3.3","description":"Shows user names next to nicks in chat.","github":"https://github.com/planetarian/BetterDiscordPlugins","github_raw":"https://raw.githubusercontent.com/planetarian/BetterDiscordPlugins/master/WhoAreYou.plugin.js"},"changelog":[{"title":"0.3.3","items":["Fix for error caused by discord update"]},{"title":"0.3.1","items":["Fix for console error caused by text nodes"]},{"title":"0.3.0","items":["Added option to swap the username/nick in chat","code cleanup"]}],"main":"index.js"};

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

    return class WhoAreYou extends Plugin {
        constructor() {
            super();

            this.defaultSettings = {
                swapUsername: false // Show the username first, then nick
            };

            this.css = ".who-username { margin-left: 3pt; }";
        }

        onStart() {
            ZLibrary.PluginUtilities.addStyle(this.getName()  + "-style", this.css);

            Logger.log("Started");
        }

        onStop() {
            ZLibrary.PluginUtilities.removeStyle(this.getName() + "-style");

            Logger.log("Stopped");
            Patcher.unpatchAll();
        }

        getSettingsPanel() {
            return Settings.SettingPanel.build(this.saveSettings.bind(this),
                new Settings.Switch("Swap username/nick", "Swaps the username and nickname of users, so the username is the primary name shown instead.",
                    this.settings.swapUsername, e => { this.settings.swapUsername = e; }));
        }
        
        observer({ addedNodes, removedNodes }) {
            if (!addedNodes || !addedNodes[0] || !addedNodes[0].classList)
                return;

            addedNodes.forEach(added => {
                if (added.nodeName == "#text")
                    return;

                // The updates we care about are
                // 1) when switching channels and getting message history, and
                // 2) when new messages arrive
                if (added.matches(".da-container")
                || added.matches(ZLibrary.DiscordSelectors.TitleWrap.chat))
                {
                    // We need to operate on the individual message elements that are contained within the updated item[s]
                    var messages;
                    if (added.matches(".da-container"))
                        messages = [added];
                    else
                        messages = added.querySelectorAll(".da-container");

                    messages.forEach(node => {
                        var usernameNode = node.find(".da-username");
                        // Multiple messages in succession won't repeat the username header, ignore these
                        if (usernameNode === null)
                            return;

                        var message = ZLibrary.ReactTools.getOwnerInstance(node).props.messages[0];

                        // Make sure the user has a nickname set, otherwise bail
                        if (message.nick === null) 
                            return;

                        if (this.settings.swapUsername)
                            usernameNode.text(message.author.username);
                        $('<span class="who-username">(' + (this.settings.swapUsername ? message.nick : message.author.username) + ')</span>')
                        .insertAfter(usernameNode)
                    });
                }
            });
            
        }
    };

};
        return plugin(Plugin, Api);
    })(global.ZeresPluginLibrary.buildPlugin(config));
})();
/*@end@*/