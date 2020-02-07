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
    const config = {"info":{"name":"WhoAreYou","authors":[{"name":"Chami","discord_id":"165709167095578625","github_username":"planetarian","twitter_username":"pir0zhki"}],"version":"0.4.1","description":"Shows user names next to nicks in chat.","github":"https://github.com/planetarian/BetterDiscordPlugins","github_raw":"https://raw.githubusercontent.com/planetarian/BetterDiscordPlugins/master/WhoAreYou.plugin.js"},"changelog":[{"title":"0.4.1","items":["Fixed a bug in the 'users typing' bar"]},{"title":"0.4.0","items":["Can now show username in 'users typing' bar","Switched to more reliable replacement method"]},{"title":"0.3.8","items":["Another fix because stuff changed *again*"]}],"main":"index.js"};

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
                swapUsername: false, // Show the username first, then nick
                translateTypingbar: true,
            };

            this.css = ".who-username { margin-left: 3pt; }";
        }

        getSettingsPanel() {
            return Settings.SettingPanel.build(this.saveSettings.bind(this),
                new Settings.SettingGroup("WhoAreYou Settings", {collapsible: false, shown: true}).append(
                    new Settings.Switch("Swap username/nick", "Swaps the username and nickname of users, so the username is the primary name shown instead.",
                        this.settings.swapUsername, e => { this.settings.swapUsername = e; }),
                    new Settings.Switch("Translate 'users typing' bar", "Shows usernames instead of nicks on the 'users typing' bar.",
                        this.settings.translateTypingbar, e => { this.settings.translateTypingbar = e; })
            ));
        }

        getModule(name) { 
            return ZLibrary.WebpackModules.getByIndex(ZLibrary.WebpackModules.getIndex(e => e.displayName === name));
        }

        onStart() {
            ZLibrary.PluginUtilities.addStyle(this.getName()  + "-style", this.css);

            this.patchTypingUsers.bind(this)();
            this.patchedMessageModule = Patcher.before(this.getModule("Message"),
                "default", (o, a) => this.beforeMessage(o, a, this));
            this.patchedHeaderModule = Patcher.after(this.getModule("MessageHeader"),
                "default", (o, a, v) => this.afterMessageHeader(o, a, v, this));
            
            Logger.log("Started");
        }

        async patchTypingUsers() {
            const TypingUsers = await ZLibrary.ReactComponents.getComponentByName("TypingUsers", ZLibrary.DiscordSelectors.Typing.typing);
            if (TypingUsers == null) return;

            Patcher.after(TypingUsers.component.prototype, "render", (o,a,v) => this.afterTypingUsers(o,a,v,this));
        }

        onStop() {
            ZLibrary.PluginUtilities.removeStyle(this.getName() + "-style");

            Patcher.unpatchAll();
            
            Logger.log("Stopped");
        }

        afterTypingUsers(obj, args, result, plugin) {
            if (!(this.settings.translateTypingbar && obj && result && obj.props.channel)) return;
            var me = ZLibrary.DiscordModules.UserStore.getCurrentUser();            
            var users = Object.keys(obj.props.typingUsers)
                .filter(id => id != me.id)
                .map(id => ({
                    user: ZLibrary.DiscordModules.UserStore.getUser(id),
                    member: ZLibrary.DiscordModules.GuildMemberStore.getMember(obj.props.channel.guild_id, id)
                }));
            if (!users.length) return;

            var userTags = result.props.children[1].props.children
                .filter(c => c).map(c => c.props)
                .filter(c => c).map(c => c.children); // nicks & undefined
            for (var i = 0; i < userTags.length; i++) {
                userTags[i][0] = users[i].user.username;
            }
        }

        beforeMessage(obj, args, plugin) {
            var data = args[0];
            var header = data.childrenHeader;
            if (header && header.props && header.props.message) {
                this.replaceMessage(header.props);
                return;
            }
            var sysMsg = data.childrenSystemMessage;
            if (sysMsg && sysMsg.props && sysMsg.props.message) {
                this.replaceMessage(sysMsg.props);
                return;
            }
        }

        replaceMessage(props) {
            var oldMessage = props.message;
            if (!oldMessage.nick) return;

            var newMessage = ZLibrary.Structs.Message.from(oldMessage).discordObject;
            if (!newMessage.realNick)
                newMessage.realNick = newMessage.nick;
            newMessage.nick = this.getDisplayName(oldMessage);

            props.message = newMessage;
        }

        afterMessageHeader(obj, args, returnValue, plugin) {
            var message = args[0].message;
            if (!message.realNick) return;
            try {
                var newChild = ZLibrary.DiscordModules.React
                    .createElement('span', {className: 'who-username'}, '(' + this.getAltName(message) + ')');
                var children = returnValue.props.children[2].props.children;
                children.push(newChild);
            }
            catch (ex) {
                Logger.log("Failed to operate on message header.");
                Logger.log(ex);
            }
        }
        
        getDisplayName(message) {
            return !this.settings.swapUsername && message.nick ? message.realNick || message.nick : message.author.username;
        }
        getAltName(message) {
            return this.settings.swapUsername ? message.realNick || message.nick : message.author.username;
        }
    };

};
        return plugin(Plugin, Api);
    })(global.ZeresPluginLibrary.buildPlugin(config));
})();
/*@end@*/
