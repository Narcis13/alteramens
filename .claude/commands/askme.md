# askme

## Description

Interview the user in-depth about a specification file, gathering detailed insights about technical implementation, UI/UX decisions, concerns, and tradeoffs, then write the completed spec back to the file.

## Prompt

Read the specification file at `$ARGUMENTS` and conduct a comprehensive interview with the user about every aspect of the spec. Use the AskUserQuestion tool to gather detailed information.

Your interview should cover:
- Technical implementation details and architecture decisions
- UI/UX choices, user flows, and interaction patterns
- Edge cases and error handling strategies
- Performance considerations and optimization opportunities
- Security concerns and data privacy implications
- Scalability and future extensibility
- Testing strategies and validation approaches
- Deployment and maintenance considerations
- Integration points with existing systems
- Tradeoffs between different implementation approaches
- Accessibility requirements
- Internationalization and localization needs
- Any ambiguities or unclear requirements in the current spec

IMPORTANT Guidelines:
- Avoid obvious questions - dig deep into nuanced decisions
- Ask about the "why" behind choices, not just the "what"
- Explore alternatives and tradeoffs for each major decision
- Challenge assumptions respectfully to ensure they've been considered
- Ask follow-up questions based on previous answers
- Focus on areas where the spec is vague or could benefit from more detail
- Use the AskUserQuestion tool with 2-4 focused questions at a time
- Continue interviewing until you have comprehensive understanding of all aspects

Process:
1. Read the spec file from the provided path
2. Analyze it to identify areas needing clarification or expansion
3. Interview the user systematically using AskUserQuestion
4. After each round of questions, incorporate the answers and identify next areas to explore
5. Continue until all aspects are thoroughly covered
6. Write the enhanced, detailed spec back to the original file
7. Confirm completion with a summary of key additions

Begin by reading the spec file and starting your interview.
