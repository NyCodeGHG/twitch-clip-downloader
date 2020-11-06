# TTV Channel Clip Downloader

>**WARNING YOU NEED TO HAVE [youtube-dl](https://youtube-dl.org/) INSTALLED**

## Installation
via yarn
```bash
yarn global add twitch-clip-downloader
```
via npm
```bash
npm install -g twitch-clip-downloader
```

## Execution
Execute it on a bash like shell or on windows in the Git Bash.
```bash
ttvdl --clientId <your twitch client id> \
      --auth <your twitch oauth token> \
      --broadcaster <twitch channel name> \
      --max <maximal parallel downloads (optional)> \
      --count <amount of clips to be downloaded (optional)>
```

Display Help Page
```bash
ttvdl --help
```

## How to get a token
Just use https://twitchtokengenerator.com. (Don't forget the client ID!).