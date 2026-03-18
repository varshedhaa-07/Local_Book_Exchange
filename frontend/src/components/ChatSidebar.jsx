import { NavLink } from 'react-router-dom';
import { getInitials } from '../utils/formatters';

export default function ChatSidebar({ conversations, activeUserId }) {
  return (
    <aside className="rounded-[2rem] border border-white/60 bg-white/85 p-4 shadow-soft">
      <p className="px-3 pt-2 text-xs font-bold uppercase tracking-[0.35em] text-coral">Chats</p>
      <div className="mt-4 space-y-2">
        {conversations.map((person) => (
          <NavLink
            key={person._id}
            to={`/chat/${person._id}`}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-2xl px-3 py-3 transition ${
                isActive || activeUserId === person._id ? 'bg-ink text-white' : 'hover:bg-mist'
              }`
            }
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-coral text-sm font-bold text-white">
              {getInitials(person.name)}
            </div>
            <div>
              <p className="font-semibold">{person.name}</p>
              <p className="text-sm opacity-75">{person.location}</p>
            </div>
          </NavLink>
        ))}
      </div>
    </aside>
  );
}
