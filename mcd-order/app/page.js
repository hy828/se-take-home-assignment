"use client"
import { useState, useEffect, useMemo } from 'react';

let orderIdCounter = 1;

export default function Home() {
  const [orders, setOrders] = useState([]);
  const [bots, setBots] = useState([]);

  const pendingOrders = useMemo(() => orders.filter(order => order.status === 'Pending' || order.status === 'Processing'), [orders]);
  const completedOrders = useMemo(() => orders.filter(order => order.status === 'Completed'), [orders]);

  // Add order function
  const addOrder = (type) => {
    const newOrder = { id: orderIdCounter++, type, status: 'Pending', bot: null };

    // Update state to reflect new orders in the UI
    setOrders(prevOrders => {
      if (type === 'VIP') {
        const index = prevOrders.findIndex(order => order.type === 'Normal');
        if (index === -1) {
          return [newOrder, ...prevOrders];
        } else {
          return [
            ...prevOrders.slice(0, index),
            newOrder,
            ...prevOrders.slice(index)
          ];
        }
      }
      return [...prevOrders, newOrder];
    });
  };

  // Add a new bot
  const addBot = () => {
    const newBot = { id: bots.length + 1, status: 'Idle', order: null, progress: 0 };
    setBots(prevBots => [...prevBots, newBot]);
  };

  // Remove the latest bot
  const removeBot = () => {
    setBots(prevBots => {
      const botToRemove = prevBots[prevBots.length - 1];
      if (botToRemove) {
        // If the bot is processing an order, set the order status to pending
        const order = orders.find(order => order.bot?.id === botToRemove.id && order.status === 'Processing');
        if(order) setOrders(prevOrders => prevOrders.map(o => o.id === order.id ? { ...order, status: 'Pending', bot: null } : o));
      }
      return prevBots.slice(0, prevBots.length - 1);
    });
  };

  // Bot processing logic
  useEffect(() => {
    // Find the first pending order and idle bot
    const order = orders.find(order => order.status === 'Pending');
    const bot = bots.find(bot => bot.status === 'Idle');
    // If both are found, assign the order to the bot
    if(order !== undefined && bot !== undefined) {
      const updatedOrder = { ...order, status: 'Processing', bot: bot };
      const updatedBot = { ...bot, status: 'Processing', order: updatedOrder, progress: 0 };
      setOrders(prevOrders => prevOrders.map(o => o.id === order.id ? updatedOrder : o));
      setBots(prevBots => prevBots.map(b => b.id === bot.id ? updatedBot : b));
    }

    // Update bot progress
    const interval = setInterval(() => {
      setBots(prevBots => {
        return prevBots.map(bot => {
          if (bot.status === 'Processing' && bot.order.status === 'Processing') {
            if (bot.progress >= 100) { // If bot has completed the order
              const updatedOrder = { ...bot.order, status: 'Completed' };
              setOrders(prevOrders => prevOrders.map(o => o.id === bot.order.id ? updatedOrder : o));
  
              return { ...bot, status: 'Idle', order: null, progress: 0 }; // Set bot to idle after completion
            } else {
              // Increment the bot's progress
              bot.progress += 5;
            }
          }
          return bot;
        });
      });
    }, 1000); // Update every second
  
    return () => clearInterval(interval);
  }, [orders, bots]);
  

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
            {pendingOrders.map(order => (
              <li key={order.id} className={`mb-2 ${order.type === 'VIP' ? 'text-red-500' : 'text-black'}`}>
                Order #{order.id} ({order.type} Customer) ({order.status}{order.status === 'Processing' ? ` by Bot #${order.bot.id}` : ''})
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
            disabled={bots.length === 0}
            className={`rounded px-4 py-2 m-2 text-white ${
              bots.length === 0 ? 'bg-gray-500 cursor-not-allowed' : 'bg-blue-500'
            }`}
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
