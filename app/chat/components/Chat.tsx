'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from './Chat.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import chatImg from '@/app/assets/about-model-image.png';
import Image from 'next/image';
import Link from 'next/link';
// import { supabase } from '@/lib/supabase';
// import { User } from '@supabase/supabase-js';
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [typingText, setTypingText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  // const [user, setUser] = useState<User | null>(null);



  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typingText]);

  // useEffect(() => {

  //   const fetchUser = async () => {
  //     try {
  //       const { data: { session } } = await supabase.auth.getSession();

  //       if (session?.user) {
  //         setUser(session.user);
  //       }
  //     } catch (error) {
  //       console.error('Error fetching user:', error);
  //     } finally {
  //     }
  //   };

  //   fetchUser();

  //   // Set up auth state listener
  //   const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
  //     if (event === 'SIGNED_IN' && session?.user) {
  //       setUser(session.user);
  //     } else if (event === 'SIGNED_OUT') {
  //       setUser(null);
  //     }
  //   });

  //   return () => {
  //     if (authListener && authListener.subscription) {
  //       authListener.subscription.unsubscribe();
  //     }
  //   };
  // }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: 'user',
      content: input,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMsg] }),
      });

      const data = await res.json();
      const text = data?.message?.content || 'Sorry, I could not process that.';
      await simulateTyping(text);
    } catch {
      await simulateTyping('⚠️ Sorry, something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  // Simulate assistant typing effect
  const simulateTyping = async (text: string) => {
    setTypingText('');
    let i = 0;
    const interval = setInterval(() => {
      setTypingText((prev) => prev + text.charAt(i));
      i++;
      if (i >= text.length) {
        clearInterval(interval);
        setMessages((prev) => [
          ...prev,
          { id: crypto.randomUUID(), role: 'assistant', content: text },
        ]);
        setTypingText('');
      }
    }, 25);
  };

  return (
    <div className={styles.chatContainer}>
      <Link className={styles.end} href={'/'}>
        <FontAwesomeIcon icon={faChevronLeft} />
        <span>End Chat</span>
      </Link>
      <div className={styles.chatMessages}>
        {messages.map((m) => (
          <div
            key={m.id}
            className={`${styles.message} ${m.role === 'user' ? styles.userMessage : styles.assistantMessage
              }`}
          >
            {m.role === 'user' ?

              // <div className={styles.avatar}> user?.user_metadata?.avatar_url ? (
              //   <Image
              //     src={user?.user_metadata?.avatar_url}
              //     width={0}
              //     height={0}
              //     alt={'avatar'}
              //     className={styles.avatarimage1}
              //   />
              // ) : (
              //   <FontAwesomeIcon icon={faUser} />
              // )</div>
              null

              : <div className={styles.avatar}><Image
                src={chatImg}
                width={0}
                height={0}
                alt={'avatar'}
                className={styles.avatarimage}
              /></div>
            }


            {/* <FontAwesomeIcon icon={m.role === 'user' ? faUser : faRobot} /> */}

            <div className={styles.bubble}>
              {m.content}
            </div>
          </div>
        ))}

        {/* Assistant typing animation */}
        {isLoading && !typingText && (
          <div className={`${styles.message} ${styles.assistantMessage}`}>
            <div className={styles.avatar}>
              <Image
                src={chatImg}
                width={0}
                height={0}
                alt={'avatar'}
                className={styles.avatarimage}
              />
            </div>
            <div className={styles.bubble}>
              <div className={styles.typingDots}>
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}

        {/* Typing text animation */}
        {typingText && (
          <div className={`${styles.message} ${styles.assistantMessage}`}>
            <div className={styles.avatar}>
              <Image
                src={chatImg}
                width={0}
                height={0}
                alt={'avatar'}
                className={styles.avatarimage}
              />
            </div>
            <div className={styles.bubble}>
              {typingText}
              <span className={styles.cursor}></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className={styles.inputContainer}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Message Samara..."
          rows={1}
          className={styles.input}
          disabled={isLoading}
        />
        <button type="submit" className={styles.sendButton} disabled={isLoading}>
          <FontAwesomeIcon icon={faPaperPlane} />
        </button>
      </form>
    </div>
  );
}
