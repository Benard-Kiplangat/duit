import Todo from "./page";

type Todo = {
  id: string;
  [key: string]: any;
}

const accentColorClass: Record<string, string> = {
  blue: "accent-blue-500/75",
  orange: "accent-orange-500/75",
  green: "accent-green-500/75",
  indigo: "accent-indigo-500/75",
  red: "accent-red-500/75",
  emerald: "accent-emerald-500/75",
  fuchsia: "accent-fuchsia-500/75",
};

export default function TodoListSection({
  title,
  todos,
  filterFn,
  handleToggleCompleted,
  handlePersistence,
  handleDeleteTodo,
}: {
  title: string;
  todos: Todo[];
  filterFn: (todo: Todo) => boolean;
  handleToggleCompleted: (id: string, completed: boolean) => void;
  handlePersistence: (id: string, recurring: boolean) => void;
  handleDeleteTodo: (id: string) => void;
}) {
  const filtered = todos.filter(filterFn);

  return (
    <div className={`section ${title.toLowerCase().replace(/\s/g, '-')}`}>
      <h4 className={`text-lg py-4 ${title === "Doing it now" ? "text-slate-900" : (title === "Completed tasks" ? "text-green-600" : "text-orange-600")} shadow-sm shadow-slate-300 font-semibold text-center w-full`}>{title}</h4>
      <div className="px-4 py-1">
        <ul>
          {title === "Doing it now" && filtered.length === 0 && (
            <li className="text-slate-900 italic pt-2">Add a todo item to get started...</li>
          )}
          {title === "Completed tasks" && filtered.length === 0 && (
            <li className="text-slate-900 italic pt-2">Complete your tasks to see them here...</li>
          )}
          {title === "Recurring tasks" && filtered.length === 0 && (
            <li className="text-slate-900 italic pt-2">Add new recurring tasks to see them here...</li>
          )}
          {filtered.length > 0 && filtered.map((todo, idx) => {
            // Use the color from the todo if present, otherwise pick the next color in order
            const colorKeys = Object.keys(accentColorClass);
            const color = colorKeys[idx % colorKeys.length];
            return (
              <li key={todo.id} className="flex items-start justify-between border-b-1 border-gray-300 py-1">
                <div className="pl-2">
                  <input
                    type="checkbox"
                    className={accentColorClass[color] || "accent-orange-500/75"}
                    checked={!!todo.completed}
                    onChange={() => handleToggleCompleted(todo.id, !!todo.completed)}
                  />
                  <span className={`task text-base font-medium text-${color}-600 px-2`}>{todo.title}</span>
                  <p className="text-xs text-slate-500">{todo.description || "No description"}</p>
                  <p className="text-xs text-orange-600 py-1">
                    <span className="text-black">Priority: </span>
                    <select 
                      className="w-12 focus:outline-none focus:border-orange-500 focus:ring-orange-500 rounded"
                      defaultValue={todo.priority || 1}
                      name="priority"
                    >
                      <option value="1">High</option>
                      <option value="2">Medium</option>
                      <option value="3">Low</option>
                    </select>
                    <span className="px-2 text-slate-500">|</span>
                    <span className="text-xs text-green-500">
                      <span className="text-black">Tags: </span>
                      <input
                        type="text"
                        placeholder="Tags (comma separated)"
                        className="focus:outline-none w-15"
                        value={todo.tags || "@new"}
                        onChange={(e) => e.target.value}
                      />
                    </span>
                    <span className="px-2 text-slate-500">|</span>
                    <span className="text-xs text-blue-600">
                      <span className="text-black">Due: </span>
                      Today
                    </span>
                    <span className="px-2 text-slate-500">|</span>
                    <span className="text-black pr-1">Recur:
                      <input 
                        className="ml-1"
                        type="checkbox" 
                        name="recur" 
                        checked={!!todo.recurring} 
                        onChange={() => { handlePersistence(todo.id, !!todo.recurring) }}/>
                    </span>
                  </p>
                </div>
                <button
                  className="px-6 pb-6 h-8 w-8 text-red-600 hover:text-red-300 text-xs py-1"
                  title="\u00D7"
                  onClick={() => handleDeleteTodo(todo.id)}
                >
                  {"\u00D7"}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
