import Navbar from './Navbar'; // Import your Navbar component
import { Fragment } from 'react';

export default function Layout({ children }) {
  return (
    <Fragment>
      <Navbar />
      <main className="ml-[213px]"> {/* Adjust content to account for the navbar width */}
        {children}
      </main>
    </Fragment>
  );
}
