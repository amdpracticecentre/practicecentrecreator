# Scenario Builder

A visual tool to create, edit, and export training scenarios for the Ticket Scenario Runner.

## How to Use

### Access the Builder
Open `builder/index.html` in your browser to start creating scenarios.

### Creating a Scenario

1. **Name Your Scenario**
   - Enter a scenario name in the top-left input field

2. **Add Stages**
   - Click "+ Add Stage" in the sidebar to create new stages
   - Each stage represents a step in the scenario flow
   - Click on a stage name to rename it (e.g., `stage-0`, `stage-1`)

3. **Add Messages to Each Stage**
   - Select a stage from the left sidebar
   - Click "+ Add Message" to add user or system text
   - Choose message type:
     - **User Message**: Message from the user (shows with typing indicator)
     - **System Text**: Centered, less opaque text for instructions or context
   - Click a message to edit or delete it

4. **Add Options (Choices)**
   - Click "+ Add Option" to add a choice for this stage
   - Fill in:
     - **Label**: What the button shows (e.g., "Close the ticket.")
     - **Your Response**: What your character says when selected
     - **Feedback**: What to show if the answer is wrong
     - **Next Stage ID**: Which stage follows this choice (e.g., `stage-1`)
     - **Correct**: Check if this is the right answer
   - Click an option to edit or delete it

### Exporting

1. **Export as JSON**
   - Click "Export JSON" to get a JSON-only file
   - Useful for backing up scenarios or sharing definitions
   - Can copy to clipboard or download

2. **Export as HTML**
   - Click "Export HTML" to generate a complete, standalone quiz
   - This creates a full `index.html` with your scenario embedded
   - Can run this HTML file directly in any browser
   - Perfect for deploying scenarios

## Message Types

- **User Messages**: Display with an avatar and typing indicator (unless it's system text)
- **System Text**: Messages that start with "You", "The", "While", or "Keep" are automatically styled as system text (centered, less opaque, no typing indicator)

## Tips

- Use clear, descriptive labels for options
- Provide constructive feedback for incorrect answers
- Test your scenario by exporting HTML and running it
- Create logical flow between stages using the "Next Stage ID" field
- Mark correct answers so users know when they've succeeded
