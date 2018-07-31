//META{"name":"DefaultChannels","website":"https://github.com/planetarian/BetterDiscordPlugins","source":"https://github.com/planetarian/BetterDiscordPlugins/blob/master/DefaultChannels.plugin.js"}*//

class DefaultChannels {
    getName() { return "DefaultChannels"; }
    getDescription() {
        return "Allows you to force discord to switch to a specific channel the first time (or every time) you switch to a particular server after launching discord. Good for e.g. checking announcement channels before moving elsewhere.";
    }
    getVersion() { return "0.0.4"; }
    getAuthor() { return "Chami"; }

    constructor() {
        this.defaultSettings = {
            DefaultChannels: {
                firstSwitchOnly: true,
                defaultChannels: {}
            }
        };
        this.settings = this.defaultSettings;
        this.updatedServers = [];
    }

    getSettingsPanel() {
        var panel = $("<form>").addClass("form").css("width", "100%");
        this.generateSettings(panel);
        return panel[0];
    }

    generateSettings(panel) {
        new PluginSettings.ControlGroup("Settings", () => {
            this.saveSettings();
        }, {
            shown: true
        }).appendTo(panel).append(
            new PluginSettings.Checkbox("First switch only", "If enabled, will only switch to the default channel the first time you switch to its server after discord loads.",
                this.settings.DefaultChannels.firstSwitchOnly, (checked) => { this.settings.DefaultChannels.firstSwitchOnly = checked;})
        );
    }
    
    loadSettings() {
        this.settings = PluginUtilities.loadSettings(this.getName(), this.defaultSettings);
    }

    saveSettings() {
        PluginUtilities.saveSettings(this.getName(), this.settings);
    }

    // Called when the plugin is loaded in to memory
    load() { this.log('Loaded'); }

    // Called when the plugin is activated (including after reloads)
    start() {
        let libraryScript = document.getElementById('zeresLibraryScript');
        if (!libraryScript || (window.ZeresLibrary && window.ZeresLibrary.isOutdated)) {
            if (libraryScript) libraryScript.parentElement.removeChild(libraryScript);
            libraryScript = document.createElement("script");
            libraryScript.setAttribute("type", "text/javascript");
            libraryScript.setAttribute("src", "https://rauenzi.github.io/BetterDiscordAddons/Plugins/PluginLibrary.js");
            libraryScript.setAttribute("id", "zeresLibraryScript");
            document.head.appendChild(libraryScript);
        }

        if (window.ZeresLibrary) this.initialize();
        else libraryScript.addEventListener("load", () => { this.initialize(); });
        
        this.log('Started');
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

    observer({ addedNodes, removedNodes }) {
        if (!addedNodes || !addedNodes[0]) return;
        let element = addedNodes[0];

        // Detect server switch
        if (element.classList && (element.classList.contains('da-searchBar') || element.classList.contains('da-chat'))) {
            this.update();
        }

        // Update channel context menu
        if (element.classList && (element.classList.contains('da-contextMenu'))) {
            let menuItems = $(element).find('.da-item');
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

            let guildName = DiscordModules.GuildStore.getGuild(guildId).name;

            let newItem = $('<div class="item-1Yvehc itemToggle-S7XGOQ dc-toggle"><div class="label-JWQiNe">Default Channel</div><div class="checkbox"><div class="checkbox-inner"><input type="checkbox"'
                + (this.settings.DefaultChannels.defaultChannels[guildId] == channelId ? ' checked' : '')
                + '><span></span></div><span></span></div></div></div>')[0];

            // Add the toggle menuitem, preferably right below the 'Mute #channel' item, but otherwise put it wherever
            if (preItem) {
                if (preItem.nextSibling)
                    preItem.parentNode.insertBefore(newItem, preItem.nextSibling);
                else
                    preItem.parentNode.append(newItem);
            }
            else {
                element.children[0].append(newItem); // Theoretically should never happen?
            }

            // Handle the click event -- set the default channel and save the settings to file
            let self = this;
            newItem = $('.dc-toggle');
            newItem.click(e => {
                let set = this.settings.DefaultChannels;
                if (set.defaultChannels[guildId] == channelId) {
                    delete set.defaultChannels[guildId];
                    newItem.find("input").prop("checked", false);
                    this.log("Default channel for '" + guildName + "' unset.");
                }
                else {
                    set.defaultChannels[guildId] = channelId;
                    newItem.find("input").prop("checked", true);
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
    
    initialize(){
        PluginUtilities.checkForUpdate(this.getName(), this.getVersion(),
            "https://raw.githubusercontent.com/planetarian/BetterDiscordPlugins/master/DefaultChannels.plugin.js");
        this.loadSettings();
        this.update();
    }

    update() {
        let ids = this.getGuildLinkIds();
        if (ids.guildId == null) return; // Not a server
        
        let config = this.settings.DefaultChannels;
        if ((config.firstSwitchOnly && this.updatedServers[ids.guildId]) // Already performed the default channel switch
        || !config.defaultChannels[ids.guildId] // No default channel set
        || DiscordModules.SelectedChannelStore.getChannelId() == config.defaultChannels[ids.guildId]) // Already in the default channel
            return;
        
        this.updatedServers[ids.guildId] = true;
        DiscordModules.NavigationUtils
            .transitionTo("/channels/" + ids.guildId + "/" + config.defaultChannels[ids.guildId]);
        this.log("Switched to default channel on '" + DiscordModules.GuildStore.getGuild(ids.guildId).name + "'");
    }

    // Get the guild/channel ids from the guild icon link. Note that the channel id returned is independent of the current channel.
    getGuildLinkIds() {
        let guildLink = $('div.guild.selected a').attr('href');
        let match = /\/channels\/(\d+)\/(\d+)/.exec(guildLink);
        return {
            guildId:match==null?null:match[1],
            channelId:match==null?null:match[2]
        };
    }
}
