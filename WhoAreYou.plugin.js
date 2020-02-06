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
    const config = {"info":{"name":"WhoAreYou","authors":[{"name":"Chami","discord_id":"165709167095578625","github_username":"planetarian","twitter_username":"pir0zhki"}],"version":"0.3.7","description":"Shows user names next to nicks in chat.","github":"https://github.com/planetarian/BetterDiscordPlugins","github_raw":"https://raw.githubusercontent.com/planetarian/BetterDiscordPlugins/master/WhoAreYou.plugin.js"},"changelog":[{"title":"0.3.7","items":["Another fix because stuff changed *again*"]},{"title":"0.3.6","items":["Additional fixes for new discord update"]},{"title":"0.3.5","items":["Fix for new discord update"]}],"main":"index.js"};

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
                // The updates we care about are
                // 1) when new messages arrive, and
                // 2) when switching channels and getting message history

                var groups;
                if (added.matches(".da-groupStart"))
                    groups = [added];
                else if (added.matches(".da-chatContent") || added.matches('.da-clickableHeader'))
                    groups = added.findAll('.da-groupStart');
                else return;
                
                for (var i = 0; i < groups.length; i++) {
                    var group = groups[i];
                    var message = ZLibrary.ReactTools.getReactInstance(group.children[0]).child.memoizedProps.message;

                    if (message == null || message.author == null) {
                        Logger.log("Invalid or no message data associated with observed element:");
                        console.log(group);
                        continue;
                    }

                    // Make sure the user has a nickname set, otherwise skip it
                    if (message.nick === null)
                        continue;

                    // Update the message header
                    var usernameNode = group.find('.da-username');
                    if (this.settings.swapUsername)
                        usernameNode.text(message.author.username);
                    $('<span class="who-username">(' + (this.settings.swapUsername ? message.nick : message.author.username) + ')</span>')
                    .insertAfter(usernameNode);
                }
            });
            
        }
    };

};
        return plugin(Plugin, Api);
    })(global.ZeresPluginLibrary.buildPlugin(config));
})();
/*@end@*/
