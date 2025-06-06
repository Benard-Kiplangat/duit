"use client";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";
import { useState, useEffect, useCallback } from "react";
import { collection, query, getDocs, doc, updateDoc, addDoc, Timestamp, deleteDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

type Todo = {
  id: string;
  [key: string]: any;
};

// Reusable section for todo lists
function TodoListSection({
  title,
  todos,
  filterFn,
  handleToggleCompleted,
  handleDeleteTodo,
}: {
  title: string;
  todos: Todo[];
  filterFn: (todo: Todo) => boolean;
  handleToggleCompleted: (id: string, completed: boolean) => void;
  handleDeleteTodo: (id: string) => void;
}) {
  const filtered = todos.filter(filterFn);
  return (
    <div className={`section ${title.toLowerCase().replace(/\s/g, '-')}`}>
      <h4 className="text-lg text-slate-900 font-semibold">{title}</h4>
      <div className="tasks">
        <ul>
          {title === "Doing it now" && filtered.length === 0 && (
            <li className="text-slate-500 italic">Add a todo item to get started...</li>
          )}
          {title === "Completed tasks" && filtered.length === 0 && (
            <li className="text-slate-500 italic">Complete your tasks to see them here...</li>
          )}
          {filtered.length > 0 && filtered.map((todo) => (
            <li key={todo.id} className="flex items-start justify-between">
              <div>
                <input
                  type="checkbox"
                  className={`accent-${todo.color || "indigo"}-500/75`}
                  checked={!!todo.completed}
                  onChange={() => handleToggleCompleted(todo.id, !!todo.completed)}
                />
                <span className={`task text-base font-medium text-${todo.color || "indigo"}-600 px-2`}>{todo.title}</span>
                <p className="text-xs text-slate-500 pl-6">{todo.description}</p>
                <p className="text-sm text-green-800 pl-6">
                  {todo.expiry
                    ? new Date(todo.expiry.seconds * 1000).toLocaleString("en-GB", {
                        timeStyle: "short",
                        hour12: true,
                      }).replace(",", " at")
                    : "11:59 pm"}
                </p>
                <p className="text-xs text-slate-500 pl-6">{todo.tags}</p>
              </div>
              <button
                className="ml-2 text-red-500 hover:text-red-700 text-sm px-2 py-1 rounded"
                title="Delete"
                onClick={() => handleDeleteTodo(todo.id)}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(false);
  const [showInput, setShowInput] = useState(false);
  const [newTodo, setNewTodo] = useState({
    completed: false,
    description: '',
    expiry: '',
    priority: '',
    tags: '',
    title: '',
    user: '',
  });

  const fetchTodos = useCallback(async () => {
    if (loading) return;

    setLoading(true);

    const q = query(collection(db, "todos"));

    const snap = await getDocs(q);

    if (!snap.empty) {
      const newTodos = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
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

    console.log(todos);

  const router = useRouter();
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      if (!user) {
        router.replace("/login");
      }
    });
    return () => unsubscribe();
  }, [router]);

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
        expiry: '',
        priority: '',
        tags: '',
        title: '',
        user: '',
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
      <main className="max-w-[36rem] min-w-[24rem] mx-auto bg-white rounded-xl shadow-lg">
        <div className="header flex items-center w-full h-12 justify-center border-solid border-b-2 border-b-orange-200">
          <div className="flex items-center justify-between w-full">
            <h1 className="pl-4 text-lg text-black font-semibold w-[50%]">Duit now, it&apos;s today</h1>
            <form className="text-left pr-2" onSubmit={handleLogout}>
              <button type="submit" className="px-4 py-2 text-red-600 rounded">Logout</button>
            </form>
          </div>
        </div>
        <div className="box h-[24rem] overflow-auto p-4">
          <TodoListSection
            title="Doing it now"
            todos={todos}
            filterFn={(todo) => todo.completed !== true}
            handleToggleCompleted={handleToggleCompleted}
            handleDeleteTodo={handleDeleteTodo}
          />
          <TodoListSection
            title="Completed tasks"
            todos={todos}
            filterFn={(todo) => todo.completed === true}
            handleToggleCompleted={handleToggleCompleted}
            handleDeleteTodo={handleDeleteTodo}
          />
        </div>
        {showInput && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Add New Todo</h3>
              <form className="space-y-3" onSubmit={e => { e.preventDefault(); handleAddTodo(); }}>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={newTodo.completed}
                    onChange={e => setNewTodo({ ...newTodo, completed: e.target.checked })}
                    id="completed"
                  />
                  <label htmlFor="completed" className="ml-2">Completed</label>
                </div>
                <input
                  type="text"
                  placeholder="Title"
                  className="w-full border rounded px-2 py-1"
                  value={newTodo.title}
                  onChange={e => setNewTodo({ ...newTodo, title: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Description"
                  className="w-full border rounded px-2 py-1"
                  value={newTodo.description}
                  onChange={e => setNewTodo({ ...newTodo, description: e.target.value })}
                />
                <input
                  type="datetime-local"
                  className="w-full border rounded px-2 py-1"
                  value={newTodo.expiry}
                  onChange={e => setNewTodo({ ...newTodo, expiry: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Priority"
                  className="w-full border rounded px-2 py-1"
                  value={newTodo.priority}
                  onChange={e => setNewTodo({ ...newTodo, priority: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Tags (comma separated)"
                  className="w-full border rounded px-2 py-1"
                  value={newTodo.tags}
                  onChange={e => setNewTodo({ ...newTodo, tags: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="User"
                  className="w-full border rounded px-2 py-1"
                  value={newTodo.user}
                  onChange={e => setNewTodo({ ...newTodo, user: e.target.value })}
                />
                <div className="flex justify-end space-x-2 pt-2">
                  <button type="button" className="px-4 py-2 bg-gray-200 rounded" onClick={() => setShowInput(false)}>Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">Add</button>
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
