//META{"name":"DefaultChannels","website":"https://github.com/planetarian/BetterDiscordPlugins","source":"https://github.com/planetarian/BetterDiscordPlugins/blob/master/DefaultChannels.plugin.js"}*//

/*@cc_on
@if (@_jscript)
    
    // Offer to self-install for clueless users that try to run this directly.
    var shell = WScript.CreateObject("WScript.Shell");
    var fs = new ActiveXObject("Scripting.FileSystemObject");
    var pathPlugins = shell.ExpandEnvironmentStrings("%APPDATA%\\BetterDiscord\\plugins");
    var pathSelf = WScript.ScriptFullName;
    // Put the user at ease by addressing them in the first person
    shell.Popup("It looks like you tried to run me directly. This is not desired behavior! It will work now, but likely will not work with other plugins. Even worse, with other untrusted plugins it may lead computer virus infection!", 0, "I'm a plugin for BetterDiscord", 0x30);
    if (fs.GetParentFolderName(pathSelf) === fs.GetAbsolutePathName(pathPlugins)) {
        shell.Popup("I'm in the correct folder already.\nJust reload Discord with Ctrl+R.", 0, "I'm already installed", 0x40);
    } else if (!fs.FolderExists(pathPlugins)) {
        shell.Popup("I can't find the BetterDiscord plugins folder.\nAre you sure it's even installed?", 0, "Can't install myself", 0x10);
    } else if (shell.Popup("Should I copy myself to BetterDiscord's plugins folder for you?", 0, "Do you need some help?", 0x34) === 6) {
        fs.CopyFile(pathSelf, fs.BuildPath(pathPlugins, fs.GetFileName(pathSelf)), true);
        // Show the user where to put plugins in the future
        shell.Exec("explorer " + pathPlugins);
        shell.Popup("I'm installed!\nJust reload Discord with Ctrl+R.", 0, "Successfully installed", 0x40);
    }
    WScript.Quit();

@else @*/

class DefaultChannels {
    getName() { return "DefaultChannels"; }
    getDescription() {
        return "Allows you to force discord to switch to a specific channel the first time (or every time) "
        + "you switch to a particular server after launching discord. "
        + "Good for e.g. checking announcement channels before moving elsewhere.";
    }
    getVersion() { return "0.0.16"; }
    getAuthor() { return "Chami"; }

    constructor() {
        this.updatedServers = [];
        this.classesDefault = {
            label: "label-JWQiNe",
            guild: "guild-1EfMGQ",
            guildSelected: "selected-ML3OIq",
            chat: "chat-3bRxxu",
            searchBar: "search-bar",
            search: "search-l1Wz-Q",
            channels: "channels-Ie2l6A",
            channelName: "name-3M0b8v",
            channelNameUnreadText: "nameUnreadText-DfkrI4",
            contextMenu: "contextMenu-HLZMGh",
            item: "item-1Yvehc",
            itemToggle: "itemToggle-S7XGOQ"
        };
        this.classesNormalized = {
            appMount: "da-appMount",
            label: "da-label",
            guild: this.classesDefault.guild,
            guildSelected: this.classesDefault.guildSelected,
            chat: "da-chat",
            searchBar: "da-searchBar",
            search: "da-search",
            channels: "da-channels",
            channelName: "da-name",
            channelNameUnreadText: "da-nameUnreadText",
            contextMenu: "da-contextMenu",
            item: "da-item",
            itemToggle: "da-itemToggle"
        };
        this.classes = this.classesDefault;
        this.defaultSettings = {
            DefaultChannels: {
                globalSwitchMode: "firstOnly",
                defaultChannels: {},
                perServerSwitchModes: {},
                useNormalizedClasses: true
            }
        };
        this.labels = {
            inherit: "Use Global",
            firstOnly: "First Open",
            always: "Always",
            unread: "Unread"
        };
    }



    getSettingsPanel() {
        var panel = $("<form>").addClass("form").css("width", "100%");
        this.generateSettings(panel);
        return panel[0];
    }

    generateSettings(panel) {
        let config = this.settings.DefaultChannels;
        new PluginSettings.ControlGroup("Settings", () => {
            this.saveSettings();
        }, {
            shown: true
        }).appendTo(panel).append(
            new PluginSettings.Checkbox("First switch only", "If enabled, will only switch to the default channel the first time you switch to its server after discord loads.",
                config.globalSwitchMode == "firstOnly" || config.firstSwitchOnly, (checked) => { config.firstSwitchOnly = checked; if (checked) config.globalSwitchMode = "firstOnly";}),
            new PluginSettings.Checkbox("Use normalized classes", "If enabled, will make use of BandagedBD's 'Normalize Classes' feature where possible. Should make the plugin more resilient to Discord updates.",
                config.useNormalizedClasses, (checked) => config.useNormalizedClasses = checked)
        );
    }

    updateClasses() {
        this.classes = this.settings.DefaultChannels.useNormalizedClasses
        ? this.classesNormalized
        : this.classesDefault;
        /*
        this.classes = (global.bdSettings
            && global.bdSettings.settings["fork-ps-4"]
            && this.settings.DefaultChannels.useNormalizedClasses)
            ? this.classesNormalized
            : this.classesDefault;
        */
    }

    // Called when the plugin is loaded in to memory
    load() { this.log('Loaded'); }

    // Called when the plugin is activated (including after reloads)
    start() {
        this.log('Starting');
        let libraryScript = document.getElementById('zeresLibraryScript');
        if (!libraryScript || (window.ZeresLibrary && window.ZeresLibrary.isOutdated)) {
            if (libraryScript) libraryScript.parentElement.removeChild(libraryScript);
            libraryScript = document.createElement("script");
            libraryScript.setAttribute("type", "text/javascript");
            libraryScript.setAttribute("src", "https://rauenzi.github.io/BetterDiscordAddons/Plugins/PluginLibrary.js");
            libraryScript.setAttribute("id", "zeresLibraryScript");
            document.head.appendChild(libraryScript);
        }

        this.initialized = false;
        if (window.ZeresLibrary) this.initialize();
        else libraryScript.addEventListener("load", () => { this.initialize(); });
        // Fallback in case load fails to fire (https://github.com/planetarian/BetterDiscordPlugins/issues/2)
        window.setTimeout(this.initialize.bind(this), 5000);
    }
    
    initialize(){
        if (this.initialized) return;
        this.initialized = true;

        this.loadSettings();
        this.update();
        
        if (this.queuedNodes && this.queuedNodes.length > 0) {
            let nodes = this.queuedNodes;
            for (var i = 0; i < nodes.length; i++) {
                this.observer(nodes);
            }
            this.queuedNodes = null;
            this.log('Queue processed');
        }

        PluginUtilities.checkForUpdate(this.getName(), this.getVersion(),
            "https://raw.githubusercontent.com/planetarian/BetterDiscordPlugins/master/DefaultChannels.plugin.js");
        
        this.log("Initialized");
    }
    
    loadSettings() {
        this.settings = PluginUtilities.loadSettings(this.getName(), this.defaultSettings);
        this.updateClasses();
    }

    saveSettings() {
        PluginUtilities.saveSettings(this.getName(), this.settings);
        this.updateClasses();
    }

    // Called when the plugin is deactivated
    stop() {
        this.log('Stopped');
    }

    unload() { this.log('Unloaded'); }

    log(text) {
        return console.log(`[%c${this.getName()}%c] ${text}`,
            'color: #F77; text-shadow: 0 0 1px black, 0 0 2px black, 0 0 3px black;', '');
    }

    error(text) {
        try {
            PluginUtilities.showToast(`[${this.getName()}] Error: ${text}`, {type:'error'});
        }
        catch (err) {}
        return console.error(`[%c${this.getName()}%c] ${text}`,
            'color: #F77; text-shadow: 0 0 1px black, 0 0 2px black, 0 0 3px black;', '');
    }

    update() {
        let ids = this.getGuildLinkIds();
        if (ids.guildId == null) return; // Not a server

        let config = this.settings.DefaultChannels;
        let switchMode = config.perServerSwitchModes[ids.guildId];
        let channelId = config.defaultChannels[ids.guildId];
        if (!channelId) return; // No default channel set

        let channelName = DiscordModules.ChannelStore.getChannel(channelId).name;
        let el = $('div.'+this.classes.channels+' .'+this.classes.channelName+':contains("'+channelName+'")')[0];
        let hasUnread = el && el.classList && el.classList.contains(this.classes.channelNameUnreadText);
        

        if (((((switchMode == "inherit" || switchMode == null) && config.firstSwitchOnly)
            || switchMode == "firstOnly") && this.updatedServers[ids.guildId]) // Already performed the default channel switch
        || (switchMode == "unread" && !hasUnread) // No new messages
        || DiscordModules.SelectedChannelStore.getChannelId() == channelId) // Already in the default channel
            return;
        
        this.updatedServers[ids.guildId] = true;
        DiscordModules.NavigationUtils
            .transitionTo("/channels/" + ids.guildId + "/" + channelId);
        this.log("Switched to default channel on '" + DiscordModules.GuildStore.getGuild(ids.guildId).name + "'");
    }

    observer({ addedNodes, removedNodes }) {
        if (!this.classes || !addedNodes || !addedNodes[0] || !addedNodes[0].classList) return;
        let element = addedNodes[0];
        let cl = element.classList;

        if (this.pluginError) return;
        if (!this.initialized) {
            if (this.queuedNodes && this.queuedNodes.length && this.queuedNodes.length > 200)
            {
                this.log('Looks like plugin was never initialized. bailing.');
                this.pluginError = true;
                this.queuedNodes = null;
                return;
            }
            this.log('Not yet initialized; queueing ' + element);
            let length = this.queuedNodes ? this.queuedNodes.length : 0;
            if (length == 0)
                this.queuedNodes = new Array();
            this.queuedNodes[length] = element;
            return;
        }

        // Detect server switch
        if (cl.contains(this.classes.search) || cl.contains(this.classes.chat)) {
            this.update();
        }

        // Update channel context menu
        if (element.classList.contains(this.classes.contextMenu)) {
            // this.log('Context menu opened');
            let menuItems = $(element).find('.' + this.classes.item);
            // Attempt to find the name of the channel we rightclicked by looking for the 'Mute #channel' item
            let preItem = null;
            let channelName = null;
            for (var i = 0; i < menuItems.length && !preItem; i++) {
                let strongItems = $(menuItems[i]).find('div > strong');
                for (var s = 0; s < strongItems.length && !preItem; s++) {
                    let si = strongItems[s];
                    if (si.innerText && si.innerText.startsWith('#')) {
                        channelName = si.innerText.substring(1);
                        preItem = menuItems[i];
                    }
                }
            }
            if (!preItem) return; // Not a channel

            // Get the ID for the channel name we found
            let ids = this.getGuildLinkIds();
            let guildId = ids.guildId;
            let channels = DiscordModules.GuildChannelsStore.getChannels(guildId)[0];
            let channelId = null;
            for (var c = 0; c < channels.length; c++) {
                let channel = channels[c].channel;
                if (channel.name == channelName) {
                    channelId = channel.id;
                    break;
                }
            }


            let config = this.settings.DefaultChannels;

            let isDefaultChannel = config.defaultChannels[guildId] == channelId;
            let defaultChannelToggle = $('<div class="'+this.classesDefault.item+' '+this.classesDefault.itemToggle+' dc-defaultChannelToggle"><div class="'+this.classesDefault.label
                +'">Default Channel</div><div class="checkbox"><div class="checkbox-inner"><input type="checkbox"'
                + (isDefaultChannel ? ' checked' : '')
                + '><span></span></div><span></span></div></div></div>')[0];


            // Add the toggle menuitem, preferably right below the 'Mute #channel' item, but otherwise put it wherever
            if (preItem.nextSibling)
                preItem.parentNode.insertBefore(defaultChannelToggle, preItem.nextSibling);
            else
                preItem.parentNode.append(defaultChannelToggle);

            // Handle the click event -- set the default channel and save the settings to file
            let self = this;
            let activeDefaultChannelToggle = $('.dc-defaultChannelToggle');

            // Server name for logging purposes
            let guildName = DiscordModules.GuildStore.getGuild(guildId).name;

            // Event for handling click of switch mode toggle
            let switchModeToggleClick = e => {
                let config = this.settings.DefaultChannels;
                if (config.perServerSwitchModes[guildId] == "firstOnly")
                    config.perServerSwitchModes[guildId] = "always";
                else if (config.perServerSwitchModes[guildId] == "always")
                    config.perServerSwitchModes[guildId] = "unread";
                else if (config.perServerSwitchModes[guildId] == "unread")
                    config.perServerSwitchModes[guildId] = "inherit";
                else // inherit/null
                    config.perServerSwitchModes[guildId] = "firstOnly";
                
                $('.dc-switchModeDescription').text(this.labels[config.perServerSwitchModes[guildId]]);
                this.log("Default channel for '" + guildName + "' switch mode set to '"+config.perServerSwitchModes[guildId]+"'.");
                self.saveSettings();
            };

            // Generate the switch mode element
            let activeSwitchModeItem = null;
            let generateSwitchModeToggle = function(channelToggleItem) {
                let switchMode = config.perServerSwitchModes[guildId];
                if (switchMode == null)
                    switchMode = "inherit";

                let item = $('<div class="'+self.classesDefault.item+' '+self.classesDefault.itemToggle+' dc-inheritModeToggle"><div class="'+self.classesDefault.label
                    +'">Default When: <span class="dc-switchModeDescription">'
                    + self.labels[switchMode]
                    + '</span></div></div></div>')[0];

                if (channelToggleItem.nextSibling)
                    channelToggleItem.parentNode.insertBefore(item, channelToggleItem.nextSibling);
                else
                    channelToggleItem.parentNode.append(item);
                    
                activeSwitchModeItem = $('.dc-inheritModeToggle');
                activeSwitchModeItem.click(switchModeToggleClick);
            };
            if (isDefaultChannel) generateSwitchModeToggle(defaultChannelToggle);

            // Handle clicking default channel toggle
            activeDefaultChannelToggle.click(e => {
                if (config.defaultChannels[guildId] == channelId) {
                    delete config.defaultChannels[guildId];
                    delete config.perServerSwitchModes[guildId];
                    activeSwitchModeItem.remove();
                    activeDefaultChannelToggle.find("input").prop("checked", false);
                    this.log("Default channel for '" + guildName + "' unset.");
                }
                else {
                    config.defaultChannels[guildId] = channelId;
                    config.perServerSwitchModes[guildId] = "inherit";
                    generateSwitchModeToggle(defaultChannelToggle);
                    activeDefaultChannelToggle.find("input").prop("checked", true);
                    this.log("Default channel for '" + guildName + "' set to '#" + channelName + "'.");
                }
                self.saveSettings();
            });
        }
    }

    // Called when a message is received
    onMessage() {}

    // Called when a server or channel is switched
    onSwitch() {}

    // Get the guild/channel ids from the guild icon link. Note that the channel id returned is independent of the current channel.
    getGuildLinkIds() {
        let guildLink = $('div.'+this.classes.guild+'.'+this.classes.guildSelected+' a').attr('href');
        let match = /\/channels\/(\d+)\/(\d+)/.exec(guildLink);
        return {
            guildId:match==null?null:match[1],
            channelId:match==null?null:match[2]
        };
    }
}
