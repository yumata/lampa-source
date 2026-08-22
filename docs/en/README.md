# Lampa Plugin Development Guide

> 🇷🇺 [Русская версия](../ru/README.md)

Everything you need to build, register, and ship a plugin for the Lampa smart TV media application.

---

## Table of Contents

### Getting Started
1. [Overview & File Structure](01-getting-started.md) — what a plugin is, directory layout, the guard pattern
2. [Lifecycle](02-lifecycle.md) — from script injection to destroy, component contract

### Communication
3. [Events System](03-events.md) — global bus, Player, PlayerVideo, Storage, Favorite events
4. [Storage & Network](04-storage-network.md) — persistent storage, HTTP requests

### Building UI
5. [Templates & Localization](05-templates-lang.md) — HTML templates, i18n, CSS injection
6. [UI Components](06-ui-components.md) — Noty, Select, Modal, focus management
7. [Navigation](07-navigation.md) — Activity stack, Component registration, Router

### Integration
8. [Settings API](08-settings.md) — add sections, toggles, selects, text inputs to Settings
9. [Manifest & Menu](09-manifest-menu.md) — card context menu hook, sidebar menu item
10. [Player Integration](10-player.md) — player event patterns, track/subtitle control

### Reference
11. [Pitfalls](11-pitfalls.md) — common mistakes and how to avoid them
12. [Debug & Logging](12-debug.md) — logging conventions, dev builds, local testing
13. [Controller & TV Navigation](13-controller.md) — focus system, arrow keys, remote key codes

---

## Quick Start

```js
function startMyPlugin() {
    window.my_plugin_ready = true

    function init() {
        // Register templates, components, settings, menu items…
    }

    if (window.appready) init()
    else Lampa.Listener.follow('app', e => { if (e.type == 'ready') init() })
}

if (!window.my_plugin_ready) startMyPlugin()
```

---

## Global Namespace Cheatsheet

| Object | Purpose |
|---|---|
| `Lampa.Listener` | Global app event bus |
| `Lampa.Storage` | Persistent key-value store |
| `Lampa.Lang` | i18n — add and translate strings |
| `Lampa.Template` | Register and retrieve HTML templates |
| `Lampa.Activity` | Push / pop navigation screens |
| `Lampa.Component` | Register page components by name |
| `Lampa.Reguest` | HTTP request wrapper (use `new`) |
| `Lampa.Select` | Bottom-sheet picker UI |
| `Lampa.Modal` | Modal overlay UI |
| `Lampa.Noty` | Toast notification |
| `Lampa.Player` | Player lifecycle events |
| `Lampa.PlayerVideo` | Video element events |
| `Lampa.PlayerPanel` | Player UI panel (tracks, subtitles) |
| `Lampa.SettingsApi` | Add settings sections and params |
| `Lampa.Manifest` | App metadata + plugin registration |
| `Lampa.Platform` | Platform detection |
| `Lampa.Subscribe` | Create a private event bus |
