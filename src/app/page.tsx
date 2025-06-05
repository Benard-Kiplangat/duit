"use client";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { onAuthStateChanged, User } from "firebase/auth";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      if (!user) {
        router.replace("/login");
      }
    });
    return () => unsubscribe();
  }, [router]);
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
          <div className="section now">
            <h4 className="text-lg text-slate-900 font-semibold">Doing it now</h4>
            <div className="tasks">
            <ul>
              <li>
                <input type="checkbox" className="accent-indigo-500/75"/>
                <span className="task text-base font-medium text-indigo-600 px-2">Task one</span>
                <p className="text-xs text-slate-500 pl-6">Relax and do the work now</p>
                <p className="text-sm text-green-800 pl-6">11:42 am</p>
                <p className="text-xs text-slate-500 pl-6">@Reading</p>
              </li>
              <li>
                <input type="checkbox" className="accent-red-500/75"/>
                <span className="task text-base font-medium text-red-600 px-2">Task one</span>
                <p className="text-xs text-slate-500 pl-6">Relax and do the work now</p>
                <p className="text-sm text-green-800 pl-6">11:42 am</p>
                <p className="text-xs text-slate-500 pl-6">@Reading</p>
              </li>
              <li>
                <input type="checkbox" className="accent-green-500/75"/>
                <span className="task text-base font-medium text-green-600 px-2">Task one</span>
                <p className="text-xs text-slate-500 pl-6">Relax and do the work now</p>
                <p className="text-sm text-green-800 pl-6">11:42 am</p>
                <p className="text-xs text-slate-500 pl-6">@Reading</p>
              </li>
              <li>
                <input type="checkbox" className="accent-orange-500/75"/>
                <span className="task text-base font-medium text-orange-600 px-2">Task one</span>
                <p className="text-xs text-slate-500 pl-6">Relax and do the work now</p>
                <p className="text-sm text-green-800 pl-6">11:42 am</p>
                <p className="text-xs text-slate-500 pl-6">@Reading</p>
              </li>
            </ul>
          </div>
          </div>
          <div className="section completed">
            <h4 className="text-lg text-slate-900 font-semibold">Completed tasks</h4>
            <div className="tasks">
            <ul>
              <li>
                <input type="checkbox" className="accent-indigo-500/75" checked/>
                <span className="task text-base font-medium text-indigo-600 px-2">Task one</span>
                <p className="text-xs text-slate-500 pl-6">Relax and do the work now</p>
                <p className="text-sm text-green-800 pl-6">11:42 am</p>
                <p className="text-xs text-slate-500 pl-6">@Reading</p>
              </li>
              <li>
                <input type="checkbox" className="accent-red-500/75" checked/>
                <span className="task text-base font-medium text-red-600 px-2">Task one</span>
                <p className="text-xs text-slate-500 pl-6">Relax and do the work now</p>
                <p className="text-sm text-green-800 pl-6">11:42 am</p>
                <p className="text-xs text-slate-500 pl-6">@Reading</p>
              </li>
              <li>
                <input type="checkbox" className="accent-green-500/75" checked/>
                <span className="task text-base font-medium text-green-600 px-2">Task one</span>
                <p className="text-xs text-slate-500 pl-6">Relax and do the work now</p>
                <p className="text-sm text-green-800 pl-6">11:42 am</p>
                <p className="text-xs text-slate-500 pl-6">@Reading</p>
              </li>
              <li>
                <input type="checkbox" className="accent-orange-500/75" checked/>
                <span className="task text-base font-medium text-orange-600 px-2">Task one</span>
                <p className="text-xs text-slate-500 pl-6">Relax and do the work now</p>
                <p className="text-sm text-green-800 pl-6">11:42 am</p>
                <p className="text-xs text-slate-500 pl-6">@Reading</p>
              </li>
            </ul>
          </div>
          </div>
        </div>
        <div className="flex pb-5">
          <div className="flex-initial w-[90%]"></div>
          <div className="flex justify-center items-center rounded-full bg-orange-500 text-centered w-8 h-8"><p className="text-white text-xl">+</p></div>
        </div>
      </main>
    </div>
  );
}
