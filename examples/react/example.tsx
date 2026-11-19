import { useState } from 'react';

interface CounterProps {
    enabled: boolean;
}

export function Counter({ enabled }: CounterProps) {
    const [count, setCount] = useState(0);

    if (!enabled) {
        return null;
    }

    return <button onClick={() => setCount(count + 1)}>{count}</button>;
}
