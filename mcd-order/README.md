# Order Control System
This project is an Order Control System built with Next.js, designed to manage Normal and VIP orders. It includes functionality to assign bots for processing orders, track their progress, and display orders based on their status (Pending or Completed).

### Live Demo
The project is hosted on Vercel and can be accessed [here](https://se-take-home-assignment-theta.vercel.app/).

### Features
- Order Management: Allows adding of new Normal and VIP orders. VIP orders are prioritized over Normal orders.
- Bot Assignment: Bots are dynamically assigned to orders and update their progress.
- Real-time Processing: Orders move from Pending to Processing and finally to Completed when the bot finishes.
- Bot Progress: Visual representation of each bot’s progress during order processing.
- Dynamic Bot Management: Bots can be added or removed dynamically.
- 
### Technologies Used
- Next.js: For server-side rendering and building the web application.
- React (Hooks): To manage state and side effects (`useState`, `useEffect`, `useMemo`).
- Tailwind CSS: For responsive and utility-first CSS styling.
- Vercel: For hosting the application.

### How to Use
1. Add Orders: Click the `New Normal Order` or `New VIP Order` buttons to add new orders to the pending queue.
2. Manage Bots: Add a bot by clicking the `+ Bot` button. Bots will automatically start processing orders.
3. Track Progress: Bots processing orders will display progress, and once completed, the order will move to the `Completed Orders` section.
4. Remove Bots: You can remove the most recent bot by clicking the `- Bot` button. If the bot is currently processing an order, the order will return to the pending queue.
