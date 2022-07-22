# TU Delft CSE Discord Bot

## Requirements

- npm
- node.js

## Setup

Create a new file in the repository directory and name it `.env`.
Put the following into that file:

> token=TOKEN

where `TOKEN` is a placeholder for the bot's private token.

Install the required packages:

> npm install

Edit `config.json` and replace the channel and message ID's which are listed there with ID's from your server. You can change some other settings there too.

Make sure your Discord server has a channel named `bot-commands` which the bot has access to, or set a different bot channel in `config.json`.

Finally, once the bot is added to the server, put its role above other roles for courses, years, honours, etc. if they exist, so that the bot can use them.

## Usage

To run the bot:

> node main.js

For a list of commands, in Discord type:

> /help

### Docker

- Deployment
  ```sh
  docker run --name discord-bot -d -e token="<TOKEN>" antoniosbarotsis/discord-bot
  ```

- For local Development
  ```sh
  docker build -t discord-bot .
  docker run --name discord-bot -d -e token="<TOKEN>" discord-bot
  ```
