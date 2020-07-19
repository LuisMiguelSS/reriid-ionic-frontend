import { Platform } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { SQLitePorter } from '@ionic-native/sqlite-porter/ngx';
import { Injectable } from '@angular/core';
import { SQLite, SQLiteObject } from '@ionic-native/sqlite/ngx';
import { BehaviorSubject, Observable } from 'rxjs';

export interface User {
  id: number;
  realId: number;
  username: string;
  thumbnail?: any;
}

export interface Chat {
  id: number;
  userId: number;
}

export interface Message {
  id: number;
  sender: string;
  content: string;
  sentAt: Date;
  readAt: Date;
  chatId: number;
}

export interface NewMessage {
  sender: string;
  content: string;
  sentAt: Date;
  readAt: Date;
}

@Injectable({
  providedIn: 'root'
})
export class SqliteService {

  private database: SQLiteObject;
  private dbReady: BehaviorSubject<boolean> = new BehaviorSubject(false);

  users = new BehaviorSubject([]);
  chats = new BehaviorSubject([]);
  messages = new BehaviorSubject([]);

  constructor(
    private sqlite: SQLite,
    private platform: Platform,
    private sqlitePorter: SQLitePorter,
    private http: HttpClient
  ) {
    this.platform.ready().then( readySource => {
      this.createDatabaseObject();
    }).catch(e => console.log(e));
  }

  private createDatabaseObject(): void {
    this.sqlite.create({
      name: 'chats.db',
      location: 'default'
    })
    .then( (db: SQLiteObject) => {
      this.database = db;
      this.seedDatabase();
    }).catch(e => console.log(e));
  }

  private seedDatabase() {
    this.http.get('../../../assets/chatdb.sql', { responseType: 'text'})
    .subscribe(sql => {
      this.sqlitePorter.importSqlToDb(this.database, sql)
      .then(_ => {
        this.loadUsers();
        this.loadChats();
        this.loadMessages();
        this.dbReady.next(true);
      })
      .catch(e => console.error(e));
    });
  }

  getDatabaseState() {
    return this.dbReady.asObservable();
  }

  getUsers(): Observable<User[]> {
    return this.users.asObservable();
  }

  getChats(): Observable<Chat[]> {
    return this.chats.asObservable();
  }

  getMessages(): Observable<Message[]> {
    return this.messages.asObservable();
  }

  loadUsers() {
    return this.database.executeSql('SELECT * FROM user', []).then(data => {
      const users: User[] = [];

      if (data.rows.length > 0) {
        for (let i = 0; i < data.rows.length; i++) {
          users.push({
            id: data.rows.item(i).id,
            realId: data.rows.item(i).id,
            username: data.rows.item(i).username,
          });
        }
      }
      this.users.next(users);
    });
  }

  loadChats() {
    return this.database.executeSql('SELECT * FROM chat', []).then(data => {
      const chats: Chat[] = [];

      if (data.rows.length > 0) {
        for (let i = 0; i < data.rows.length; i++) {
          chats.push({
            id: data.rows.item(i).id,
            userId: data.rows.item(i).userId,
          });
        }
      }
      this.chats.next(chats);
    });
  }

  loadMessages() {
    return this.database.executeSql('SELECT * FROM message', []).then(data => {
      const messages: Message[] = [];

      if (data.rows.length > 0) {
        for (let i = 0; i < data.rows.length; i++) {
          messages.push({
            id: data.rows.item(i).id,
            sender: data.rows.item(i).sender,
            content: data.rows.item(i).content,
            sentAt: data.rows.item(i).sentAt,
            readAt: data.rows.item(i).readAt,
            chatId: data.rows.item(i).chatId,
          });
        }
      }
      this.messages.next(messages);
    });
  }

  addUser(realId: number, username: string) {
    return this.database.executeSql('INSERT INTO user (realId,username) VALUES (?,?)', [realId, username]).then(data => {
      this.loadUsers();
    });
  }

  addChatWithUser(realId: number, username: string) {
    return new Promise((resolve, reject) => {

      this.chatExists(username).then(result => {
        console.log('AddChatWithUser, chat exists with that user? ' + result);
        if (!result) {

          // Create chat
          this.getUserByName(username).then(user => {
            this.addChat(user.id).then(() => resolve());
          });

        }
      }).catch(error => reject(error));
    });
  }

  addChat(userId: number) {
    return this.database.executeSql('INSERT INTO chat (userId) VALUES (?)', [userId]).then(data => {
      this.loadChats();
    });
  }

  addMessage(sender: string = null, content: string, sentAt: Date, readAt: Date = null, chatId: number) {
    return this.database.executeSql('INSERT INTO message (sender, content, sentAt, readAt, chatId) VALUES (?, ?, ?, ?, ?)',
    [sender, content, sentAt, readAt, chatId]).then(data => {
      this.loadMessages();
    });
  }

  getUser(id: number): Promise<User> {
    return this.database.executeSql('SELECT * FROM user WHERE id = ?', [id]).then(data => {
      return {
        id: data.rows.item(0).id,
        realId: data.rows.item(0).realId,
        username: data.rows.item(0).username,
      };
    });
  }

  getUserByName(username: string): Promise<User> {
    return this.database.executeSql('SELECT * FROM user WHERE username = ?', [username]).then(data => {
      return {
        id: data.rows.item(0).id,
        realId: data.rows.item(0).realId,
        username: data.rows.item(0).username,
      };
    });
  }

  getChat(id: number): Promise<Chat> {
    return this.database.executeSql('SELECT * FROM chat WHERE id = ?', [id]).then(data => {
      return {
        id: data.rows.item(0).id,
        userId: data.rows.item(0).userId,
      };
    });
  }

  getChatWithUser(username: string): Promise<Chat> {
    return new Promise((resolve, reject) => {
      this.database.executeSql('SELECT chat.* FROM chat, user WHERE user.id = chat.userId and user.username = ?', [username])
      .then(data => {
        console.log('GetChatWithUser: ' + username + ", " + JSON.stringify(data));
        resolve(data.rows.length > 0 ? {
          id: data.rows.item(0).id,
          userId: data.rows.item(0).userId,
        } : null);
      }).catch(error => reject(error));
    });
  }

  getMessage(id: number): Promise<Message> {
    return this.database.executeSql('SELECT * FROM message WHERE id = ?', [id]).then(data => {
      return {
        id: data.rows.item(0).id,
        sender: data.rows.item(0).sender,
        content: data.rows.item(0).content,
        sentAt: data.rows.item(0).sentAt,
        readAt: data.rows.item(0).readAt,
        chatId: data.rows.item(0).chatId,
      };
    });
  }

  deleteUser(id: number) {
    return this.database.executeSql('DELETE FROM user WHERE id = ?', [id]).then(_ => {
      this.loadUsers();
      this.loadChats();
      this.loadMessages();
    });
  }

  deleteChat(id: number) {
    return this.database.executeSql('DELETE FROM chat WHERE id = ?', [id]).then(_ => {
      this.loadChats();
      this.loadMessages();
    });
  }

  deleteMessage(id: number) {
    return this.database.executeSql('DELETE FROM message WHERE id = ?', [id]).then(_ => {
      this.loadMessages();
    });
  }

  markMessageAsRead() {
    return this.database.executeSql('UPDATE message SET readAt = ?', [new Date()]).then(_ => {
      this.loadMessages();
    });
  }

  userExists(username: string) {
    return new Promise ((resolve, reject) => {
      this.database.executeSql('SELECT * FROM user WHERE username = ?', [username]).then(result => {
        resolve(result.rows.length > 0);
      }). catch(error => {
        reject(error);
      });
    });
  }

  chatExists(username: string) {
    return this.database.executeSql('SELECT chat.* FROM chat, user WHERE chat.userId = user.id and username = ?',
    [username]).then(result => {
      return result.rows.length > 0;
    }). catch(_ => {
      return false;
    });
  }

  addMessageToConversationWithUser(realId: number, username: string, message: NewMessage) {
    this.userExists(username).then( (result: boolean) => {
      if (result) {
        // User exists
        this.chatExists(username).then( (res: boolean) => {
          if (res) {
            // Chat exists
            this.getChatWithUser(username).then(chat => {
              this.addMessage(
                message.sender,
                message.content,
                message.sentAt,
                message.readAt,
                chat.id
              );
            });
          } else {
            // Chat does not exist
            this.addChatWithUser(realId, username);

            // Add message to chat
            this.getChatWithUser(username).then(chat => {
              this.addMessage(
                message.sender,
                message.content,
                message.sentAt,
                message.readAt,
                chat.id
              );
            });
          }
        });
      } else {
        // User does not exist
        this.addUser(realId, username).then( _ => {
          // Create chat
          this.addChatWithUser(realId, username)
          .then( () => {
            // Add message to chat
            this.getChatWithUser(username).then(chat => {
              this.addMessage(
                message.sender,
                message.content,
                message.sentAt,
                message.readAt,
                chat.id
              );
            });
          });
        });
      }
    }).catch(error => console.log('An error ocurred trying to add a new message: ' + error));
  }

}
