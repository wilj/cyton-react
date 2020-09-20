import React from 'react';
export type HelloCytonProps = {
    message: string
}
export function HelloCyton({message}:HelloCytonProps) {
    return <div>Message: {message}</div>
}