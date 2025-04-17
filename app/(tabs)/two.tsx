import React, { useState, useEffect } from 'react';
import { Text, View, TextInput, TouchableOpacity, ScrollView, SafeAreaView, Alert, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FontAwesome, MaterialIcons, AntDesign, FontAwesome5 } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import tw from 'twrnc';

export default function TabTwoScreen() {
  const [todoList, setTodoList] = useState([]);
  const [namaTugas, setNamaTugas] = useState('');
  const [mapel, setMapel] = useState('');
  const [tanggal, setTanggal] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadTodoList();
  }, []);

  useEffect(() => {
    saveTodoList();
  }, [todoList]);

  const loadTodoList = async () => {
    try {
      const dataTugas = await AsyncStorage.getItem('todoList');
      if (dataTugas !== null) {
        const parsedTugas = JSON.parse(dataTugas);
        const todoListProcessed = parsedTugas.map(tugas => ({
          ...tugas,
          tanggal: new Date(tugas.tanggal)
        }));
        setTodoList(todoListProcessed);
      }
    } catch (error) {
      console.error('Gagal load tugas:', error);
    }
  };

  const saveTodoList = async () => {
    try {
      await AsyncStorage.setItem('todoList', JSON.stringify(todoList));
    } catch (error) {
      console.error('Gagal save tugas:', error);
    }
  };

  const tambahTugas = () => {
    if (namaTugas.trim() === '' || mapel.trim() === '') {
      return;
    }

    if (isEditing) {
      const updatedTugas = todoList.map(tugas =>
        tugas.id === editingId ? {
          ...tugas,
          nama: namaTugas,
          mapel: mapel,
          tanggal: tanggal
        } : tugas
      );
      setTodoList(updatedTugas);
      setIsEditing(false);
      setEditingId(null);
    } else {
      const tugasBaru = {
        id: Date.now().toString(),
        nama: namaTugas,
        mapel: mapel,
        tanggal: tanggal,
        selesai: false
      };
      setTodoList([...todoList, tugasBaru]);
    }

    setNamaTugas('');
    setMapel('');
    setTanggal(new Date());
  };

  const editTugas = (tugas) => {
    setNamaTugas(tugas.nama);
    setMapel(tugas.mapel);
    setTanggal(new Date(tugas.tanggal));
    setEditingId(tugas.id);
    setIsEditing(true);
  };

  const toggleSelesai = (id) => {
    const updatedTugas = todoList.map(tugas =>
      tugas.id === id ? { ...tugas, selesai: !tugas.selesai } : tugas
    );
    setTodoList(updatedTugas);
  };

  const hapusTugas = (id) => {
    Alert.alert(
      "Konfirmasi",
      "Yakin mau hapus tugas ini?",
      [
        {
          text: "Batal",
          style: "cancel"
        },
        {
          text: "Hapus",
          onPress: () => {
            const updatedTugas = todoList.filter(tugas => tugas.id !== id);
            setTodoList(updatedTugas);
          },
          style: "destructive"
        }
      ]
    );
  };

  const formatTanggal = (date) => {
    return `${date.getDate()} ${getMonthName(date.getMonth())} ${date.getFullYear()}`;
  };

  const getMonthName = (month) => {
    const bulan = ["Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
    return bulan[month];
  };

  const handleDateSelect = (day) => {
    const selectedDate = new Date(day.timestamp);
    if (selectedDate < new Date()) {
      Alert.alert(
        "Tanggal tidak valid",
        "Tanggal tidak boleh kurang dari tanggal hari ini."
      );
      return;
    }
    setTanggal(selectedDate);
    setShowDatePicker(false);
  };

  return (
    <SafeAreaView style={tw`flex-1 bg-gray-100`}>
      <View style={tw`px-5 mt-16`}>
        <View style={tw`flex-row items-center mb-4 gap-4`}>
          <FontAwesome5 name="clipboard-list" size={24} color="black" />
          <Text style={tw`text-2xl font-bold text-gray-800`}>Tugasku</Text>
        </View>

        <View style={tw`mb-6`}>
          <TextInput
            style={tw`bg-gray-200 p-3 rounded-md mb-2 shadow-2xl shadow-black`}
            placeholder="Ada tugas Apa hari ini?"
            value={namaTugas}
            onChangeText={setNamaTugas}
          />
          <TextInput
            style={tw`bg-gray-200 p-3 rounded-md mb-2 shadow-2xl shadow-black`}
            placeholder="Mapelnya apa tu?"
            value={mapel}
            onChangeText={setMapel}
          />

          <TouchableOpacity
            style={tw`flex-row bg-gray-200 rounded-md mb-2`}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={tw`flex-1 p-3`}>
              {formatTanggal(tanggal)}
            </Text>
            <View style={tw`bg-blue-900 p-3 rounded-r-md`}>
              <MaterialIcons name="date-range" size={24} color="white" />
            </View>
          </TouchableOpacity>

          <Modal
            visible={showDatePicker}
            transparent={true}
            animationType="slide"
          >
            <View style={tw`flex-1 justify-center bg-black bg-opacity-50`}>
              <View style={tw`bg-white m-4 rounded-lg`}>
                <Calendar
                  onDayPress={handleDateSelect}
                  markedDates={{
                    [tanggal.toISOString().split('T')[0]]: { selected: true, selectedColor: '#1e3a8a' }
                  }}
                />
                <TouchableOpacity
                  style={tw`p-4 items-center border-t border-gray-200`}
                  onPress={() => setShowDatePicker(false)}
                >
                  <Text style={tw`text-blue-900 font-bold`}>Batal</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          <TouchableOpacity
            style={tw`bg-blue-900 p-4 rounded-md items-center`}
            onPress={tambahTugas}
          >
            <Text style={tw`text-white font-medium`}>{isEditing ? 'Update Tugas' : 'Tambah Tugas'}</Text>
          </TouchableOpacity>
        </View>

        {todoList.length === 0 ? (
          <Text style={tw`font-bold text-gray-500 mb-2 text-center`}>YEAY GADA TUGAS KAMU</Text>
        ) : (
          <>
            <Text style={tw`font-bold text-gray-500 mb-2`}>ADA TUGAS NI KAMU!</Text>
            <ScrollView>
              {todoList.map((tugas) => (
                <View key={tugas.id} style={tw`flex-row items-center bg-white rounded-md p-2 mb-2 shadow-sm`}>
                  <TouchableOpacity
                    style={tw`mr-2`}
                    onPress={() => toggleSelesai(tugas.id)}
                  >
                    {tugas.selesai ? (
                      <View style={tw`w-6 h-6 bg-green-600 rounded items-center justify-center`}>
                        <AntDesign name="check" size={16} color="white" />
                      </View>
                    ) : (
                      <View style={tw`w-6 h-6 border border-gray-300 rounded`}></View>
                    )}
                  </TouchableOpacity>

                  <View style={tw`flex-1`}>
                    <Text style={tw`font-bold text-gray-800`}>{tugas.nama}</Text>
                    <Text style={tw`text-sm text-gray-600`}>{tugas.mapel}</Text>
                    <Text style={tw`text-xs text-gray-500`}>
                      {formatTanggal(tugas.tanggal)}
                    </Text>
                  </View>

                  <View style={tw`flex-row`}>
                    <TouchableOpacity
                      style={tw`bg-blue-600 w-8 h-8 rounded-md items-center justify-center mr-1`}
                      onPress={() => editTugas(tugas)}
                    >
                      <FontAwesome name="pencil" size={16} color="white" />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={tw`bg-red-600 w-8 h-8 rounded-md items-center justify-center`}
                      onPress={() => hapusTugas(tugas.id)}
                    >
                      <MaterialIcons name="delete" size={16} color="white" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}