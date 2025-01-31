import React, { useContext, useEffect, useState } from "react";
import styles from "./FlatDetails.module.css";
import { useParams, NavLink, useNavigate } from "react-router-dom";
import { db } from "../../firebase";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { AuthContext } from "../Context/AuthContext";
import toast, { Toaster } from "react-hot-toast";

const FlatDetails = () => {
  const { id } = useParams();//aducem id-ul apartamentului din URL
  const { userId, loggedIn } = useContext(AuthContext);
  const navigate = useNavigate();
  const [flat, setFlat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageContent, setMessageContent] = useState("");
  //pe baza id-ului apartamentului identificam din baza de date apartamentul corespunzator si incarcam detaliile
  useEffect(() => {
    const fetchFlatDetails = async () => {
      const flatDocRef = doc(db, "flats", id);//cream referinta catre documetul flats si apartamentul cu id-ul corespunzator
      const flatDoc = await getDoc(flatDocRef);//asteptam incarcarea datelor
      if (flatDoc.exists()) {
        setFlat(flatDoc.data());//actualizam starea cu apartamentul gasit
      } else {
        toast.error("Flat not found");
        navigate("/home");
      }
    };

    fetchFlatDetails();
  }, [id, navigate]);

  const fetchMessages = async () => {
    const messagesCollection = collection(db, "messages"); //cream colectia messages
    const q = query(messagesCollection, where("flatId", "==", id)); //identificam mesajul pe baza id-ului
    const querySnapshot = await getDocs(q);
    const messagesData = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    // sortare mesaje in ordine inversa cronologic
    messagesData.sort((a, b) => b.timestamp.toDate() - a.timestamp.toDate());
    setMessages(messagesData);
  };

  useEffect(() => {
    fetchMessages();
  }, [id]);

  // gestioneaza trimiterea unui mesaj nou și actualizarea automată a mesajelor
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageContent) return;

    try {
      const messagesCollection = collection(db, "messages");
      await addDoc(messagesCollection, {
        flatId: id,
        userId,
        userName: `${loggedIn.firstName} ${loggedIn.lastName}`,
        userEmail: loggedIn.email,
        content: messageContent,
        timestamp: new Date(),
      });
      toast.success("Message sent successfully");
      setMessageContent("");
      fetchMessages(); // actualizare automata a mesajelor dupa trimiterea unui mesaj
    } catch (error) {
      toast.error("Failed to send message");
      console.error("Failed to send message:", error);
    }
  };

  if (!flat) {
    return (
      <div className={styles.container}>
        <div className={styles.loader}></div>
        <div className={styles.loadingText}>Don't hurry... be HAPPY</div>
      </div>
    );
  }

  const filteredMessages =
    userId === flat.userId
      ? messages
      : messages.filter((message) => message.userId === userId);

  return (
    <div className={styles.container}>
      <div>
        <Toaster />
      </div>
      <h1 className={styles.title}>Flat Details</h1>

      <div className={styles.verticalTable}>
        <div className={styles.verticalHeader}>City</div>
        <div className={styles.verticalItem}>{flat.city}</div>

        <div className={styles.verticalHeader}>Street Name</div>
        <div className={styles.verticalItem}>{flat.streetName}</div>

        <div className={styles.verticalHeader}>Street Number</div>
        <div className={styles.verticalItem}>{flat.streetNumber}</div>

        <div className={styles.verticalHeader}>Size</div>
        <div className={styles.verticalItem}>{flat.size} m²</div>

        <div className={styles.verticalHeader}>Has AC</div>
        <div className={styles.verticalItem}>{flat.hasAc ? "Yes" : "No"}</div>

        <div className={styles.verticalHeader}>Year Built</div>
        <div className={styles.verticalItem}>{flat.yearBuild}</div>

        <div className={styles.verticalHeader}>Price</div>
        <div className={styles.verticalItem}>{flat.price} €</div>

        <div className={styles.verticalHeader}>Available Date</div>
        <div className={styles.verticalItem}>{flat.availableDate}</div>
      </div>

      {userId === flat.userId ? (
        <div className={styles.actionContainer}>
          <NavLink className={styles.actionButton} to={`/edit-flat/${id}`}>
            Edit
          </NavLink>
        </div>
      ) : (
        <form className={styles.messageForm} onSubmit={handleSendMessage}>
          <textarea
            value={messageContent}
            onChange={(e) => setMessageContent(e.target.value)}
            placeholder="Type your message here"
            className={styles.textarea}
            required
          />
          <button type="submit" className={styles.sendButton}>
            Send Message
          </button>
        </form>
      )}

      <h2 className={styles.messagesTitle}>Messages</h2>
      <div className={styles.messagesContainer}>
        <ul className={styles.messagesList}>
          {filteredMessages.map((message) => (
            <li key={message.id} className={styles.messageItem}>
              <p>
                From: {message.userName} ({message.userEmail})
              </p>
              <p>
                Date: {new Date(message.timestamp.toDate()).toLocaleString()}
              </p>
              <p>{message.content}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default FlatDetails;
