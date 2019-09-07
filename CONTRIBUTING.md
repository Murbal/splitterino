# Contribute to Splitterino

## Development GitLab server

The GitHub repository is merely mirroring the `master`-branch from the development GitLab server.

To work on the project effectively, you should contact one of the [maintainers](#maintainers) to get access and start working.

---

### Reasoning

GitHub is nice and all, but for better organization we have a private GitLab server. It has more features regarding code and ticket management.

Handling tickets internally helps keeping the GitHub issues clean for bug-reports and doesn't let people think we have 700 issues, while most of them are feature requests and enhancements.

## Workflow

- Search for a ticket/bug you want to work on
  - If you can't find anything, you can ask the maintainers to get one
  - Assign the ticket to you or let it get assigned to you
- Branch off from the `master`-branch
  - Name your branch properly: `<type>/<ticket-number>-<description>`
  - `type`: The type of the ticket, like `feature`, `change`, `bugfix`
  - `ticket-number`: Uhhh ... the ticket number?
  - `description`: The summary/title of the ticket, in lower kebab case
- Keep the code clean:
  - Keep up the liniting rules (via TSLint)
  - Format your code (via Prettier/TSLint)
  - Organize the imports (easiest way is via TypeScript Hero):
    - package-imports first, separated with a new line to the project-imports
    - project-imports, which have to be relative and as direct as possible
- Commit your changes into the branch with descriptive and meaningful commit messages
- Attempt to write unit-tests directly
- Make sure the tests are working - otherwise fix them

## Maintainers

Currently two people are maintaining splitterino:
- PreFiXAUT
  - Discord: PreFiXAUT#7904
  - E-mail: [mail@prefix.moe](mailto:mail@prefix.moe)
- SirChronus (Chronus):
  - Discord: SirChronus#1921
  - E-mail: [chronus@prefix.moe](mailto:chronus@prefix.moe)

You can also reach the maintainers via the official Splitterino Discord server [here](https://discord.gg/tCxVXcu).
