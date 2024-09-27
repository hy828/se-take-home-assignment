"use client"
import { useState, useEffect } from 'react';

let orderIdCounter = 1;
let botIdCounter = 1;
let orderQueue = [];
let freeBots = [];

export default function Home() {
  const [orders, setOrders] = useState([]);
  const [completedOrders, setCompletedOrders] = useState([]);
  const [bots, setBots] = useState([]);

  // Add order function
  const addOrder = (type) => {
    const newOrder = { id: orderIdCounter, type, status: 'Pending', bot: null };
    orderIdCounter++;

    // Update external order queue
    if (type === 'VIP') {
      const normalIndex = orderQueue.findIndex(order => order.type === 'Normal');
      if (normalIndex === -1) {
        orderQueue.unshift(newOrder); // Add VIP order to the front
      } else {
        orderQueue.splice(normalIndex, 0, newOrder); // Insert VIP before normal orders
      }
    } else {
      orderQueue.push(newOrder); // Normal order goes to the end
    }

    // Update state to reflect new orders in the UI
    setOrders([...orderQueue]);
  };

  // Add a new bot
  const addBot = () => {
    const newBot = { id: botIdCounter, status: 'Idle', order: null, progress: 0 };
    botIdCounter++;
    freeBots.push(newBot);
    setBots([...freeBots]);
  };

  // Remove the latest bot
  const removeBot = () => {
    botIdCounter--;
    setBots(prevBots => {
      const botToRemove = prevBots[prevBots.length - 1];
      const order = orderQueue.find(order => order.bot.id === botToRemove.id);
      order.status = 'Pending';
      freeBots = freeBots.filter(bot => bot.id !== botToRemove.id);
      return prevBots.slice(0, prevBots.length - 1);
    });
  }; 

  // Bot processing logic
  useEffect(() => {
    const interval = setInterval(() => {
      if(orderQueue.length > 0 && freeBots.length > 0) {
        const order = orderQueue.find(order => order.status === 'Pending');
        if(order !== undefined) {
          const bot = freeBots.shift();
          order.status = 'Processing';
          order.bot = bot;
          bot.status = 'Processing';
          bot.order = order;
          bot.progress = 0;
        }
        
      }
      setBots(prevBots => {
        return prevBots.map(bot => {
          if (bot.status === 'Processing' && bot.order.status === 'Processing') {
            if (bot.progress >= 100) {
              bot.order.status = 'Completed';
              bot.status = 'Idle';
              // Move order to completed
              setCompletedOrders(prevCompleted => [...prevCompleted, bot.order]);
              freeBots.push(bot);
              freeBots.sort((a, b) => a.id - b.id);
              orderQueue = orderQueue.filter(order => order.id !== bot.order.id);
              setOrders([...orderQueue]);
  
              return { ...bot, status: 'Idle', order: null }; // Set bot to idle after completion
            } else {
              // Increment the bot's progress
              bot.progress += 10;
            }
          }
          return bot;
        });
      });
    }, 1000); // Update every second
  
    return () => clearInterval(interval);
  }, [bots, orders]);
  

  return (
    <div className="p-5">
      <div className="mb-4">
        <button 
          onClick={() => addOrder('Normal')}
          className="border border-black rounded px-4 py-2 mr-2 text-black hover:bg-black hover:text-white"
        >
          New Normal Order
        </button>
        <button 
          onClick={() => addOrder('VIP')}
          className="border border-red-500 rounded px-4 py-2 text-red-500 hover:bg-red-500 hover:text-white"
        >
          New VIP Order
        </button>
      </div>
      <div className="mb-4">
        <h3 className="text-lg font-bold">Pending Orders</h3>
        <ul className="bg-yellow-200 p-4 rounded h-4">
          {orders.map(order => (
            <li key={order.id} className={`mb-2 ${order.type === 'VIP' ? 'text-red-500' : 'text-black'}`}>
              Order #{order.id} ({order.type})({order.status})
            </li>
          ))}
        </ul>
      </div>
      <div className="mb-4">
        <h3 className="text-lg font-bold">Complete Orders</h3>
        <ul className="bg-green-200 p-4 rounded">
          {completedOrders.map(order => (
            <li key={order.id} className={`mb-2 ${order.type === 'VIP' ? 'text-red-500' : 'text-black'}`}>
              Order #{order.id} ({order.type})
            </li>
          ))}
        </ul>
      </div>
      <div className="mb-4">
        <button
          onClick={addBot}
          className="border border-blue-500 rounded px-4 py-2 mr-2 text-blue-500 hover:bg-blue-500 hover:text-white"
        >
          + Bot
        </button>
        <button 
          onClick={removeBot}
          className="border border-gray-500 rounded px-4 py-2 text-gray-500 hover:bg-gray-500 hover:text-white"
        >
          - Bot
        </button>
      </div>
      <div>
        <h3 className="text-lg font-bold">Bots</h3>
        <ul className="bg-gray-200 p-4 rounded">
          {bots.map(bot => (
            <li key={bot.id} className="mb-4">
              <div className="mb-2">
                Bot #{bot.id} - {bot.status} {bot.status === 'Processing' ? `(Processing Order #${bot.order.id})` : ""}
              </div>
              {bot.status === 'Processing' && (
                <div className="relative pt-1">
                  <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-300">
                    <div 
                      style={{ width: `${bot.progress || 0}%` }} 
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                    ></div>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
