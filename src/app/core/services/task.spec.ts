import { TestBed } from '@angular/core/testing';
import { Storage } from '@ionic/storage-angular';

import { firstValueFrom } from 'rxjs';

import { TaskService } from './task';
import { ETaskPriority } from '../enum/task.enum';
import type { ITask } from '../models/task.model';


type StorageMock = {
    defineDriver: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
    get: ReturnType<typeof vi.fn>;
    set: ReturnType<typeof vi.fn>;
    driver: string | null;
};

describe('TaskService', () => {
    let service: TaskService;
    let storage: StorageMock;

    const task: ITask = {
        id: 'task-1',
        title: 'Comprar café',
        description: null,
        priority: ETaskPriority.HIGH,
        completed: false,
        createdAt: '2026-08-23T10:00:00.000Z',
        updatedAt: '2026-08-23T10:00:00.000Z'
    };

    beforeEach(() => {
        storage = {
            defineDriver: vi.fn().mockResolvedValue(undefined),
            create: vi.fn(),
            get: vi.fn().mockResolvedValue(null),
            set: vi.fn().mockResolvedValue(undefined),
            driver: 'cordovaSQLiteDriver'
        };

        storage.create.mockResolvedValue(storage);

        TestBed.configureTestingModule({
            providers: [TaskService, { provide: Storage, useValue: storage }]
        });

        service = TestBed.inject(TaskService);
    });

    it('se instancia', () => {
        expect(service).toBeTruthy();
    });

    describe('inicialización', () => {
        it('define el driver SQLite antes de crear la base', async () => {
            await firstValueFrom(service.getAll());

            expect(storage.defineDriver).toHaveBeenCalledTimes(1);
            expect(storage.defineDriver.mock.invocationCallOrder[0])
                .toBeLessThan(storage.create.mock.invocationCallOrder[0]);
        });

        it('inicializa una sola vez aunque se hagan varias operaciones', async () => {
            await firstValueFrom(service.getAll());
            await firstValueFrom(service.saveAll([task]));
            await firstValueFrom(service.getAll());

            expect(storage.defineDriver).toHaveBeenCalledTimes(1);
            expect(storage.create).toHaveBeenCalledTimes(1);
        });

        it('no inicializa nada hasta que se hace la primera operación', () => {
            expect(storage.defineDriver).not.toHaveBeenCalled();
            expect(storage.create).not.toHaveBeenCalled();
        });

        it('sigue funcionando si el driver SQLite no está disponible', async () => {
            storage.defineDriver.mockRejectedValue(new Error('plugin nativo ausente'));
            storage.get.mockResolvedValue([task]);

            await expect(firstValueFrom(service.getAll())).resolves.toEqual([task]);
            expect(storage.create).toHaveBeenCalledTimes(1);
        });

        it('expone el driver activo', () => {
            expect(service.driver).toBe('cordovaSQLiteDriver');
        });
    });

    describe('getAll', () => {
        it('devuelve las tareas guardadas', async () => {
            storage.get.mockResolvedValue([task]);

            await expect(firstValueFrom(service.getAll())).resolves.toEqual([task]);
            expect(storage.get).toHaveBeenCalledWith('tasks');
        });

        it('devuelve un array vacío cuando no hay nada guardado', async () => {
            storage.get.mockResolvedValue(null);

            await expect(firstValueFrom(service.getAll())).resolves.toEqual([]);
        });

        it('propaga el error si el almacenamiento falla al leer', async () => {
            storage.get.mockRejectedValue(new Error('lectura fallida'));

            await expect(firstValueFrom(service.getAll())).rejects.toThrow('lectura fallida');
        });
    });

    describe('saveAll', () => {
        it('guarda la colección completa bajo la clave tasks', async () => {
            await firstValueFrom(service.saveAll([task]));

            expect(storage.set).toHaveBeenCalledWith('tasks', [task]);
        });

        it('acepta una colección vacía', async () => {
            await firstValueFrom(service.saveAll([]));

            expect(storage.set).toHaveBeenCalledWith('tasks', []);
        });

        it('propaga el error si el almacenamiento falla al escribir', async () => {
            storage.set.mockRejectedValue(new Error('escritura fallida'));

            await expect(firstValueFrom(service.saveAll([task]))).rejects.toThrow('escritura fallida');
        });
    });
});
