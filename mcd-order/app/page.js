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
      const order = orderQueue.find(order => order.bot?.id === botToRemove.id);
      if(order) order.status = 'Pending';
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
    <div className="flex flex-col items-center h-screen">
      {/* Header Section */}
      <div className="flex items-center justify-center py-4">
        <h1 className="text-2xl font-bold">Order Control System</h1>
      </div>
      
      {/* Order Button */}
      <div className="">
          <button 
            onClick={() => addOrder('Normal')}
            className="rounded px-4 py-2 mr-2 bg-blue-500 text-white"
          >
            New Normal Order
          </button>
          <button 
            onClick={() => addOrder('VIP')}
            className="rounded px-4 py-2 bg-blue-500 text-white"
          >
            New VIP Order
          </button>
        </div>
      {/* Orders Section */}
      <div className="flex w-full h-[50%]">
        {/* Pending Orders */}
        <div className="flex-1 border-2 rounded-md border-yellow-200 m-5">
          <h2 className="text-lg font-semibold text-center bg-yellow-200 p-2">Pending Orders</h2>
          <ul className="p-4 h-[85%] overflow-auto">
            {orders.map(order => (
              <li key={order.id} className={`mb-2 ${order.type === 'VIP' ? 'text-red-500' : 'text-black'}`}>
                Order #{order.id} ({order.type} Customer) ({order.status})
              </li>
            ))}
          </ul>
        </div>

        {/* Completed Orders */}
        <div className="flex-1 border-2 rounded-md border-green-300 m-5">
          <h2 className="text-lg font-semibold text-center bg-green-300 p-2">Completed Orders</h2>
          <ul className="p-4 h-[85%] overflow-auto">
            {completedOrders.map(order => (
              <li key={order.id} className={`mb-2 ${order.type === 'VIP' ? 'text-red-500' : 'text-black'}`}>
                Order #{order.id} ({order.type} Customer)
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bot Section */}
      <div className="flex flex-row m-4 w-full h-[30%]">
        {/* Button */}
        <div className="p-4 flex flex-col w-[7%]">
          <button
            onClick={addBot}
            className="rounded px-4 py-2 m-2 bg-blue-500 text-white"
          >
            + Bot
          </button>
          <button 
            onClick={removeBot}
            className="rounded px-4 py-2 m-2 bg-blue-500 text-white"
          >
            - Bot
          </button>
        </div>

        <div className="flex flex-start overflow-x-auto border-2 border-blue-800 rounded w-[100%] mr-4">
          {bots.map(bot => (
            <div key={bot.id} className="border rounded p-4 m-2 bg-blue-200 w-48 flex-shrink-0">
              <div>Bot #{bot.id}</div>
              <div>{bot.status}</div>
              <div>{bot.status === 'Processing' ? `Order: #${bot.order.id}` : ''}</div>
              {bot.status === 'Processing' && (
                <div className="relative pt-1">
                  <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-blue-300">
                    <div 
                      style={{ width: `${bot.progress || 0}%` }} 
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-500"
                    ></div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
