//META{"name":"KCLinks","displayName":"KCLinks","website":"https://github.com/planetarian/BetterDiscordPlugins","source":"https://raw.githubusercontent.com/planetarian/BetterDiscordPlugins/master/KCLinks.plugin.js"}*//
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

var KCLinks = (() => {
    const config = {"info":{"name":"KCLinks","authors":[{"name":"Chami","discord_id":"165709167095578625","github_username":"planetarian","twitter_username":"pir0zhki"}],"version":"0.1.1","description":"Detects Kantai Collection related text in chat and provides convenient relevant ctrl-clickable links.","github":"https://github.com/planetarian/BetterDiscordPlugins","github_raw":"https://raw.githubusercontent.com/planetarian/BetterDiscordPlugins/master/KCLinks.plugin.js"},"changelog":[{"title":"0.1.1","items":["Added link tooltips"]},{"title":"0.1.0","items":["Added quest links"]},{"title":"0.0.2","items":["Code cleanup"]}],"main":"index.js"};

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

    return class KCLinks extends Plugin {
        constructor() {
            super();

            this.defaultSettings = {
                mapLinks: true, // Show links for map names
                questLinks: true // Show links for quest IDs
            };

            this.css = "";
        }

        onStart() {
            ZLibrary.PluginUtilities.addStyle(this.getName() + "-style", this.css);

            Logger.log("Started");
        }

        onStop() {
            ZLibrary.PluginUtilities.removeStyle(this.getName() + "-style");

            Logger.log("Stopped");
            Patcher.unpatchAll();
        }

        getSettingsPanel() {
            return Settings.SettingPanel.build(this.saveSettings.bind(this),
                new Settings.Switch("Show Map Links", "Shows links for map names.",
                    this.settings.mapLinks, e => { this.settings.mapLinks = e; }),
                new Settings.Switch("Show Quest Links", "Shows links for quest IDs.",
                    this.settings.questLinks, e => { this.settings.questLinks = e; }));
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
                if (added.matches(ZLibrary.DiscordSelectors.Messages.container)
                    || added.matches(ZLibrary.DiscordSelectors.TitleWrap.chat)
                    || added.matches(ZLibrary.DiscordSelectors.Messages.message)) {

                    // We need to operate on the individual message elements that are contained within the updated item[s]
                    var messageNodes;
                    if (added.matches(ZLibrary.DiscordSelectors.Messages.message)) {
                        messageNodes = [added];
                    }
                    else messageNodes = added.querySelectorAll(ZLibrary.DiscordSelectors.Messages.message);

                    messageNodes.forEach(node => {

                        // Make sure this isn't an in-process message
                        var containerNode = node.querySelectorAll('.container-206Blv')[0];
                        if (containerNode.matches('.isSending-1nPcL7'))
                            return;

                        // Get the node containing the message text
                        var markupNode = node.querySelectorAll('.markup-2BOw-j');
                        if (!markupNode || markupNode.length === 0)
                            return;
                        markupNode = markupNode[0];

                        var content = markupNode.innerHTML;
                        var newContent = content;

                        if (this.settings.mapLinks) {
                            const regexp = /\bW?(?<world>[1-7]{1,2}|E)-(?<map>[1-7])(?:[a-z]\w{0,2})?\b/gi;

                            // Replace mentions of map names with links to those maps on KCNav
                            // TODO: make this a popout that offers links to KCNav, Wikia, enkcwiki, etc.
                            const mapReplacer = function (match, worldStr, mapStr, offset, string) {
                                var map = Number(mapStr);
                                const worlds5 = ['2','3','4','5','6'];
                                if (worldStr === '1' && map > 6) return match;
                                if (worlds5.includes(worldStr) && map > 5) return match;
                                if (worldStr === '7' && map > 2) return match;
                                if (worldStr.toLowerCase() === 'e') return match;
                                return '<a title="Ctrl-click to open in KCNav" href="http://kc.piro.moe/nav/#/' + worldStr + '-' + map + '">' + match + '</a>';
                            };
                            content = content.replace(regexp, mapReplacer);
                        }

                        if (this.settings.questLinks) {
                            const regexp = /\b(?<type>A|B[dwmq]?|C|D|E|F|G|WA)(?<number>\d{1,3})\b/gi;

                            const questReplacer = function (match, type, numStr, offset, string) {
                                return '<a title="Ctrl-click to open in KC Mission Control" href="http://kc.piro.moe/quests/#/search?query=' + match + '&type=1&comp=true&locked=true">' + match + '</a>';
                            }
                            content = content.replace(regexp, questReplacer);
                        }
                        markupNode.innerHTML = content;

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