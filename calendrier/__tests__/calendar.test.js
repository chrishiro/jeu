describe('Calendrier', () => {
    let mockFetch;
    
    beforeEach(() => {
        // Mock fetch pour les tests
        mockFetch = jest.fn();
        global.fetch = mockFetch;
        
        // Setup du DOM
        document.body.innerHTML = `
            <div id="calendar"></div>
            <div id="eventForm">
                <form id="addEventForm">
                    <input type="text" id="eventTitle">
                    <textarea id="eventDescription"></textarea>
                    <input type="datetime-local" id="eventStart">
                    <input type="datetime-local" id="eventEnd">
                    <select id="eventPerson">
                        <option value="chris">Chris</option>
                        <option value="morgane">Morgane</option>
                        <option value="both">Les deux</option>
                    </select>
                    <input type="color" id="eventColor">
                    <select id="eventCategories" multiple></select>
                    <input type="checkbox" id="eventReminder">
                </form>
            </div>
        `;
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    test('formatDateTime formate correctement la date', () => {
        const testDate = new Date('2025-06-17T14:30:00');
        const formattedDate = formatDateTime(testDate);
        expect(formattedDate).toBe('2025-06-17T14:30');
    });

    test('openEventForm initialise correctement le formulaire', () => {
        const testDate = new Date('2025-06-17T14:30:00');
        openEventForm(testDate, testDate);
        
        expect(document.getElementById('eventStart').value).toBe('2025-06-17T14:30');
        expect(document.getElementById('eventEnd').value).toBe('2025-06-17T14:30');
        expect(document.getElementById('eventForm').style.display).toBe('block');
    });

    test('closeEventForm réinitialise correctement le formulaire', () => {
        // Simuler un formulaire ouvert
        document.getElementById('eventForm').style.display = 'block';
        document.getElementById('eventTitle').value = 'Test Event';
        
        closeEventForm();
        
        expect(document.getElementById('eventForm').style.display).toBe('none');
        expect(document.getElementById('eventTitle').value).toBe('');
    });

    test('loadCategories charge correctement les catégories', async () => {
        const mockCategories = [
            { id: 1, nom: 'Travail' },
            { id: 2, nom: 'Personnel' }
        ];

        mockFetch.mockResolvedValueOnce({
            json: () => Promise.resolve(mockCategories)
        });

        await loadCategories();

        const select = document.getElementById('eventCategories');
        expect(select.children.length).toBe(2);
        expect(select.children[0].value).toBe('1');
        expect(select.children[0].textContent).toBe('Travail');
    });

    test('addEventForm soumet correctement les données', async () => {
        const form = document.getElementById('addEventForm');
        document.getElementById('eventTitle').value = 'Test Event';
        document.getElementById('eventStart').value = '2025-06-17T14:30';
        document.getElementById('eventPerson').value = 'chris';

        mockFetch.mockResolvedValueOnce({
            json: () => Promise.resolve({ success: true })
        });

        const submitEvent = new Event('submit');
        form.dispatchEvent(submitEvent);

        expect(mockFetch).toHaveBeenCalledWith(
            'calendirer.php',
            expect.objectContaining({
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
        );
    });

    test('La suppression d\'un événement fonctionne correctement', async () => {
        const mockEvent = {
            id: '123',
            title: 'Test Event',
            remove: jest.fn()
        };

        mockFetch.mockResolvedValueOnce({
            json: () => Promise.resolve({ success: true })
        });

        // Simuler la confirmation de l'utilisateur
        global.confirm = jest.fn(() => true);

        const eventClickHandler = calendar.getOption('eventClick');
        await eventClickHandler({ event: mockEvent });

        expect(mockFetch).toHaveBeenCalledWith(
            'calendirer.php',
            expect.objectContaining({
                method: 'POST',
                body: JSON.stringify({
                    action: 'delete',
                    id: '123'
                })
            })
        );
        expect(mockEvent.remove).toHaveBeenCalled();
    });
});
