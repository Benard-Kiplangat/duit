"use client";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";
import { useState, useEffect, useCallback } from "react";
import { collection, query, getDocs, doc, updateDoc, addDoc, Timestamp, deleteDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import {useAuth} from "../hooks/useAuth";
import TodoListSection from "./todoList";

type Todo = {
  id: string;
  completed: boolean,
    description: string,
    expiry: Date,
    recurring: boolean,
    priority: 'High' | 'Medium' | 'Low',
    color: string,
    tags: string,
    title: string,
    user: string,
    [key: string]: any;
};

export default function Home() {
  const user = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [activeTab, setActiveTab] = useState("Current tasks");
  const [newTodo, setNewTodo] = useState({
    completed: false,
    description: '',
    expiry: new Date(),
    recurring: false,
    priority: 'High',
    color: 'orange',
    tags: '',
    title: '',
    user: 'Anonymous',
  });

  const colors = ["red", "blue", "green", "indigo", "emerald", "slate", "gray", "blue", "fuchsia", "green"]

  // Fetching todos from firebase
  const fetchTodos = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    const q = query(collection(db, "todos"));
    const snap = await getDocs(q);
    if (!snap.empty) {
      // Use your Todo type for type safety
      const newTodos: Todo[] = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Todo));
      newTodos.forEach((aTodo) => {
        // Convert expiry to Date if it's a Firestore Timestamp
        let expiryDate = aTodo.expiry;
        if (expiryDate && (expiryDate as any).seconds) {
          expiryDate = new Date((expiryDate as any).seconds * 1000);
        } else if (typeof expiryDate === 'string') {
          expiryDate = new Date(expiryDate);
        }
        // Only check expiry if it exists on the todo
        if (expiryDate && expiryDate <= new Date() && !aTodo.recurring) handleDeleteTodo(aTodo.id);
        if (expiryDate && expiryDate <= new Date() && aTodo.recurring) {
          handleToggleCompleted(aTodo.id, aTodo.completed);
          updateExpiry(aTodo.id);
        }
      });
      setTodos(() => {
        return [...newTodos];
      });
    }
    setTimeout(() => {
      setLoading(false);
    }, 3000);
  }, [loading]);

  

  useEffect(() => {
    if (todos.length === 0) {
      fetchTodos();
    }
  }, [fetchTodos, todos.length]);

  const router = useRouter();
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      if (!user) {
        router.replace("/login");
      }
    });
    return () => unsubscribe();
  }, [router]);

  //change if a todo is complete or not
  const handleToggleCompleted = async (todoId: string, currentCompleted: boolean) => {
    try {
      await updateDoc(doc(db, "todos", todoId), {
        completed: !currentCompleted,
      });
      setTodos((prev) =>
        prev.map((todo) =>
          todo.id === todoId ? { ...todo, completed: !currentCompleted } : todo
        )
      );
    } catch (error) {
      alert("Failed to update todo: " + (error as Error).message);
    }
  };

  const dateStr = (date: Date) => `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()} 00:00 AM`;

  const updateExpiry = async (todoId: string) => {
    try {
      await updateDoc(doc(db, "todos", todoId), {
        expiry: dateStr(new Date()),
      });
      setTodos((prev) =>
        prev.map((todo) =>
          todo.id === todoId ? { ...todo, expiry: new Date() } : todo
        )
      );
    } catch (error) {
      alert("Failed to update todo: " + (error as Error).message);
    }
  };

  // Add new todo to Firestore
  const handleAddTodo = async () => {
    try {
      const todoData = {
        ...newTodo,
        expiry: newTodo.expiry ? Timestamp.fromDate(new Date(newTodo.expiry)) : null,
      };
      await addDoc(collection(db, "todos"), todoData);
      setShowInput(false);
      setNewTodo({
        completed: false,
        description: '',
        expiry: new Date,
        recurring: false,
        priority: 'High',
        color: "orange",
        tags: '@new',
        title: '',
        user: 'Anonymous',
      });
      fetchTodos();
    } catch (error) {
      alert("Failed to add todo: " + (error as Error).message);
    }
  };

  const handleDeleteTodo = async (todoId: string) => {
    try {
      await deleteDoc(doc(db, "todos", todoId));
      setTodos((prev) => prev.filter((todo) => todo.id !== todoId));
    } catch (error) {
      alert("Failed to delete todo: " + (error as Error).message);
    }
  };

  const handleLogout = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signOut(auth);
      router.push("/login");
    } catch (error) {
      alert("Logout failed: " + (error as Error).message);
    }
  };
  return (
    <div className="font-[family-name:var(--font-geist-sans)] bg-blue-100 w-screen h-screen py-15 px-6">
      <main className="max-w-[32rem] min-w-[24rem] mx-auto bg-white rounded-xl shadow-lg">
        <div className="header flex items-center w-full h-12 justify-center border-b-2 border-b-slate-300 bg-gray-900 rounded-t-xl">
          <div className="flex items-center justify-between w-full">
            <h1 className="pl-4 text-lg text-white font-semibold">Duit now, it&apos;s today</h1>
            <form className="text-left pr-2" onSubmit={handleLogout}>
              <button type="submit" className="px-4 py-2 text-orange-600 rounded cursor-pointer">Logout</button>
            </form>
          </div>
        </div>
        <div className="box h-[24rem] overflow-auto">
          <div className="w-full flex justify-center bg-blue-100 border-b-2 border-slate-300"> 
              <div className={`p-4 w-full border-r-2 flex items-center text-center border-slate-300 ${activeTab === "Current tasks" ? "bg-blue-500" : ""} hover:bg-blue-300`} onClick={(e) => setActiveTab(e.target.innerHTML)}>Current tasks</div>
              <div className={`p-4 w-full border-r-2 text-center border-slate-300 ${activeTab === "Completed tasks" ? "bg-blue-500" : ""} hover:bg-blue-300`} onClick={(e) => setActiveTab(e.target.innerHTML)}>Completed tasks</div>
              <div className={`p-4 w-full text-center ${activeTab === "Recurring tasks" ? "bg-blue-500" : ""} hover:bg-blue-300`} onClick={(e) => setActiveTab(e.target.innerHTML)}>Recurring tasks</div>
          </div>
          { activeTab === "Current tasks" && (
          <TodoListSection
            title="Doing it now"
            todos={todos}
            filterFn={(todo) => todo.completed !== true}
            handleToggleCompleted={handleToggleCompleted}
            handleDeleteTodo={handleDeleteTodo}
          />
          )}
          { activeTab === "Completed tasks" && (
          <TodoListSection
            title="Completed tasks"
            todos={todos}
            filterFn={(todo) => todo.completed === true}
            handleToggleCompleted={handleToggleCompleted}
            handleDeleteTodo={handleDeleteTodo}
          />
          )}
          { activeTab === "Recurring tasks" && (
            <TodoListSection
            title="Recurring tasks"
            todos={todos}
            filterFn={(todo) => todo.recurring === true}
            handleToggleCompleted={handleToggleCompleted}
            handleDeleteTodo={handleDeleteTodo}
          />
          )}
        </div>
        {showInput && (
          <div className="fixed inset-0 flex items-center justify-center bg-blue-100 bg-opacity-30 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Add New Todo</h3>
              <form className="space-y-3" onSubmit={e => { e.preventDefault(); handleAddTodo(); }}>
                <input
                  type="text"
                  placeholder="Title"
                  className="text-slate-900 px-4 py-2 border border-orange-300 focus:outline-none focus:border-orange-500 focus:ring-orange-500 rounded mb-2 w-full"
                  value={newTodo.title}
                  onChange={e => setNewTodo({ ...newTodo, title: e.target.value })}
                  required
                />
                <textarea
                  placeholder="Description"
                  className="text-slate-900 h-32 px-4 py-2 border border-orange-300 focus:outline-none focus:border-orange-500 focus:ring-orange-500 rounded mb-2 w-full"
                  value={newTodo.description}
                  onChange={e => setNewTodo({ ...newTodo, description: e.target.value })}
                >
                </textarea>
                <select 
                className="text-slate-900 px-4 py-2 border border-orange-300 focus:outline-none focus:border-orange-500 focus:ring-orange-500 rounded mb-2 w-full"
                name="priority"
                value={newTodo.priority}
                onChange={e => setNewTodo({ ...newTodo, priority: e.target.value as 'High' | 'Medium' | 'Low' })}
                >
                  <option className="text-slate-900" value="High">High</option>
                  <option className="text-slate-900" value="Medium">Medium</option>
                  <option className="text-slate-900" value="Low">Low</option>
                </select>
                <input
                  type="datetime-local"
                  className="text-slate-900 px-4 py-2 border border-orange-300 focus:outline-none focus:border-orange-500 focus:ring-orange-500 rounded mb-2 w-full"
                  value={String(newTodo.expiry)}
                  onChange={e => setNewTodo({ ...newTodo, expiry: new Date(e.target.value) })}
                />
                <input
                  type="text"
                  placeholder="Tags (comma separated)"
                  className="text-slate-900 px-4 py-2 border border-orange-300 focus:outline-none focus:border-orange-500 focus:ring-orange-500 rounded mb-2 w-full"
                  value={newTodo.tags}
                  onChange={e => setNewTodo({ ...newTodo, tags: e.target.value })}
                />
                <div className="flex items-center text-slate-900 pt-1">
                  <input
                    type="checkbox"
                    checked={newTodo.recurring}
                    onChange={e => setNewTodo({ ...newTodo, recurring: e.target.checked })}
                    id="recurring"
                  />
                  <label htmlFor="recurring" className="ml-2 text-slate-900">Persistent/Recurring</label>
                </div>
                <input
                  type="text"
                  className="text-slate-900 px-4 py-2 border border-orange-300 focus:outline-none focus:border-orange-500 focus:ring-orange-500 rounded mb-2 w-full"
                  value={user?.uid || ''}
                  onChange={e => setNewTodo({ ...newTodo, user: e.target.value })}
                  hidden
                />
                <input
                  type="text"
                  className="text-slate-900 px-4 py-2 border border-orange-300 focus:outline-none focus:border-orange-500 focus:ring-orange-500 rounded mb-2 w-full"
                  value={newTodo.color}
                  onChange={e => setNewTodo({ ...newTodo, color: e.target.value })}
                  hidden
                />
                <div className="flex justify-end space-x-2 pt-2">
                  <button type="button" className="px-4 py-2 bg-gray-200 rounded cursor-pointer" onClick={() => setShowInput(false)}>Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded cursor-pointer">Add</button>
                </div>
              </form>
            </div>
          </div>
        )}
        <div className="flex pb-5">
          <div className="flex-initial w-[90%]"></div>
          <div className="flex justify-center items-center rounded-full bg-orange-500 text-centered w-8 h-8 cursor-pointer" onClick={() => setShowInput(true)}><p className="text-white text-xl">+</p></div>
        </div>
      </main>
    </div>
  );
}
