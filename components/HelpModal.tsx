
import React from 'react';
import Modal from './Modal';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Help & Information">
      <div className="space-y-6 text-slate-700">
        
        <div className="bg-lime-50 p-4 rounded-lg border border-lime-200">
          <h3 className="text-lg font-bold text-lime-800 mb-2">What is ZERO Track?</h3>
          <p className="text-lime-900">
            ZERO Track is your personal subscription manager. It helps you keep an eye on all your recurring payments, see where your money is going, and get timely reminders before the next billing date so you can decide whether to keep or cancel a service.
          </p>
        </div>

        <div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">How Your Data is Stored</h3>
          <p>
            All your subscription data is saved directly on this device using your browser's local storage. This means your information is private, secure, and available even when you're offline.
          </p>
          <p className="mt-2 text-sm text-slate-500">
            <strong>Note:</strong> Your data is not synced across devices. Subscriptions added on your phone will not appear on your computer, and vice-versa.
          </p>
        </div>

        <div>
          <h3 className="text-lg font-bold text-slate-800 mb-2">How to Install This App</h3>
          <p>
            You can install ZERO Track on your phone or computer for easy access, just like a native app. This is called a Progressive Web App (PWA).
          </p>
          <ul className="list-disc list-inside mt-3 space-y-2 pl-2">
            <li>
              <strong>On Desktop (Chrome/Edge):</strong> Look for an icon that looks like a screen with a downward arrow in your browser's address bar, then click "Install".
            </li>
            <li>
              <strong>On Android (Chrome):</strong> Tap the three-dot menu in the top-right corner and select "Install app" or "Add to Home Screen".
            </li>
            <li>
              <strong>On iPhone/iPad (Safari):</strong> Tap the "Share" button (a square with an arrow) at the bottom, then scroll down and select "Add to Home Screen".
            </li>
          </ul>
        </div>
        
        <div className="flex justify-end pt-4">
          <button onClick={onClose}
            className="px-4 py-2 bg-lime-600 text-white rounded-md hover:bg-lime-700 font-semibold transition-colors shadow-sm">
            Got it!
          </button>
        </div>

      </div>
    </Modal>
  );
};

export default HelpModal;
