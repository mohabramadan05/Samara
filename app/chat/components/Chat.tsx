'use client';
import styles from './Chat.module.css';
import { useChat } from 'ai/react';
import { Button, Loader } from '@mantine/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane, faRobot, faUser, faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import Link from 'next/link';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
  });

  return (
    <form onSubmit={handleSubmit} className={styles.chatContainer}>
      <div className={styles.chatBox}>
        <div className={styles.chatHeader}>
          <Link href="/" className={styles.exitButton}>
            <FontAwesomeIcon icon={faArrowLeft} />
            <span>Exit Chat</span>
          </Link>
        </div>
        <div className={styles.messagesArea}>
          {messages.map((m) => (
            <div
              key={m.id}
              className={
                m.role === 'user'
                  ? styles.userMessage
                  : styles.botMessage
              }
            >
              <div className={styles.avatar}>
                {m.role === 'user' ? <FontAwesomeIcon icon={faUser} /> : <FontAwesomeIcon icon={faRobot} />}
              </div>
              <div className={styles.bubble}>
                <span className={styles.messageText}>{m.content}</span>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className={styles.botMessage}>
              <div className={styles.avatar}>
                <FontAwesomeIcon icon={faRobot} />
              </div>
              <div className={styles.bubble}>
                <span className={styles.typingIndicator}>يكتب... / Typing...</span>
              </div>
            </div>
          )}
        </div>
        <div className={styles.inputArea}>
          <textarea
            value={input}
            onChange={handleInputChange}
            placeholder="Ask something..."
            rows={2}
            disabled={isLoading}
            className={styles.textarea}
          />
          <Button type="submit" disabled={isLoading} className={styles.sendButton}>
            {isLoading ? <Loader size="xs" /> :

              <FontAwesomeIcon className={styles.sendIcon} icon={faPaperPlane} />}
          </Button>

        </div>
      </div>
    </form>
  );
}
