export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="text-gray-500 text-sm">
            © {currentYear} Get Referred. All rights reserved.
          </div>
          <div className="flex space-x-6">
            <a
              href="#"
              className="text-gray-500 hover:text-gray-900 text-sm"
              onClick={(e) => {
                e.preventDefault();
                // Add Terms of Service modal/page later
              }}
            >
              Terms
            </a>
            <a
              href="#"
              className="text-gray-500 hover:text-gray-900 text-sm"
              onClick={(e) => {
                e.preventDefault();
                // Add Privacy Policy modal/page later
              }}
            >
              Privacy
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
