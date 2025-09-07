import React from 'react';
import { getMyFaqs, addFaq, updateFaq, deleteFaq } from '../services/api';

const FAQManager = () => {
    const [faqs, setFaqs] = React.useState({ qAndA: [] });
    const [q, setQ] = React.useState('');
    const [a, setA] = React.useState('');
    const [loading, setLoading] = React.useState(true);

    const load = async () => {
        setLoading(true);
        try {
            const data = await getMyFaqs();
            setFaqs(data || { qAndA: [] });
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    React.useEffect(() => { load(); }, []);

    const onAdd = async () => {
        if (!q.trim() || !a.trim()) return;
        await addFaq(q, a);
        setQ('');
        setA('');
        await load();
    };

    const onUpdate = async (index, item) => {
        await updateFaq(index, item);
        await load();
    };

    const onDelete = async (index) => {
        await deleteFaq(index);
        await load();
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex gap-2">
                <input value={q} onChange={e => setQ(e.target.value)} placeholder="Question" className="border border-gray-700 bg-gray-800 text-gray-100 px-3 py-2 rounded w-1/2" />
                <input value={a} onChange={e => setA(e.target.value)} placeholder="Answer" className="border border-gray-700 bg-gray-800 text-gray-100 px-3 py-2 rounded w-1/2" />
                <button onClick={onAdd} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded">Add</button>
            </div>
            <div className="space-y-3">
                {faqs?.qAndA?.map((item, idx) => (
                    <div key={idx} className="border border-gray-700 bg-gray-900 p-3 rounded flex items-center gap-2">
                        <input className="border border-gray-700 bg-gray-800 text-gray-100 px-2 py-1 rounded flex-1" value={item.q} onChange={e => onUpdate(idx, { q: e.target.value })} />
                        <input className="border border-gray-700 bg-gray-800 text-gray-100 px-2 py-1 rounded flex-1" value={item.a} onChange={e => onUpdate(idx, { a: e.target.value })} />
                        <button onClick={() => onDelete(idx)} className="text-red-400 hover:text-red-300 px-3 py-1">Delete</button>
                    </div>
                ))}
                {(!faqs?.qAndA || faqs.qAndA.length === 0) && <div className="text-gray-400">No FAQs yet.</div>}
            </div>
        </div>
    );
};

export default FAQManager;


