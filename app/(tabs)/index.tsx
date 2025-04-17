import { View, Text, TextInput, TouchableOpacity, FlatList } from 'react-native';
import React, { useEffect, useState } from 'react';
import tw from 'twrnc';
import * as ScreenCapture from 'expo-screen-capture';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AntDesign, FontAwesome5 } from '@expo/vector-icons';

const index = () => {
  const [kerjaan, setkerjaan] = useState('');
  const [semuaKerjaan, setsemuaKerjaan] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    ambilData();
  }, []);

  useEffect(() => {
    simpanData();
  }, [semuaKerjaan]);  

  const ambilData = async () => {
    try {
      const data = await AsyncStorage.getItem('kerjaan');
      if (data) {
        setsemuaKerjaan(JSON.parse(data));
      }
    } catch (error) {
      console.log('Gagal ambil data:', error);
    }
  };

  const simpanData = async () => {
    try {
      await AsyncStorage.setItem('kerjaan', JSON.stringify(semuaKerjaan));
    } catch (error) {
      console.log('Gagal simpan data:', error);
    }
  };

  const tambahKerjaan = () => {
    if (kerjaan.trim() !== '') {
      if (editingId !== null) {
        const kerjaanDiupdate = semuaKerjaan.map((item) =>
          item.id === editingId ? { ...item, teks: kerjaan } : item
        );
        setsemuaKerjaan(kerjaanDiupdate);
        setEditingId(null);
      } else {
        const kerjaanBaru = { id: Date.now(), teks: kerjaan, kelar: false };
        setsemuaKerjaan([...semuaKerjaan, kerjaanBaru]);
      }
      setkerjaan('');
    }
  };

  const ubahStatusKelar = (id) => {
    const kerjaanDiupdate = semuaKerjaan.map((item) =>
      item.id === id ? { ...item, kelar: !item.kelar } : item
    );
    setsemuaKerjaan(kerjaanDiupdate);
  };

  const hapusKerjaan = (id) => {
    const kerjaanSisa = semuaKerjaan.filter((item) => item.id !== id);
    setsemuaKerjaan(kerjaanSisa);
    if (editingId === id) {
      setEditingId(null);
      setkerjaan('');
    }
  };

  const editKerjaan = (id, teks) => {
    setEditingId(id);
    setkerjaan(teks);
  };

  const renderItem = ({ item }) => (
    <View style={[
      tw`flex-row items-center justify-between p-3 mb-2 rounded-lg shadow-sm`,
      selectedId === item.id ? tw`bg-gray-200` : tw`bg-white`,
    ]}>
      <TouchableOpacity 
        style={tw`flex-row items-center flex-1`} 
        onPress={() => ubahStatusKelar(item.id)}
        onLongPress={() => setSelectedId(item.id)}
      >
        <View style={tw`mr-4`}>
          {item.kelar ? (
            <AntDesign name="checksquare" size={24} color="green" />
          ) : (
            <AntDesign name="checksquareo" size={24} color="gray" />
          )}
        </View>
        <Text style={[
          tw`flex-1 text-base`,
          item.kelar && tw`line-through text-gray-400`
        ]}>
          {item.teks}
        </Text>
      </TouchableOpacity>
      <View style={tw`flex-row items-center gap-4`}>
        <TouchableOpacity onPress={() => editKerjaan(item.id, item.teks)}>
          <AntDesign name="edit" size={22} color="blue" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => hapusKerjaan(item.id)}>
          <FontAwesome5 name="trash" size={20} color="red" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={tw`flex-1 bg-gray-50 px-4 pt-4`}>
      <View style={tw`flex-row items-center mb-6`}>
        <FontAwesome5 name="clipboard-list" size={28} color="brown" style={tw`mr-3`} />
        <Text style={tw`text-3xl font-bold text-gray-800`}>nGopoyo</Text>
      </View>

      <View style={tw`flex-row items-center mb-6`}>
        <TextInput
          style={tw`flex-1 bg-white rounded-lg p-3 mr-3 shadow-sm text-base`}
          placeholder="Mau ngapain hari ini?"
          value={kerjaan}
          onChangeText={(text) => setkerjaan(text)}
        />
        <TouchableOpacity 
          style={tw`bg-blue-600 rounded-lg p-3 shadow-sm`} 
          onPress={tambahKerjaan}
        >
          <AntDesign name={editingId !== null ? "check" : "plus"} size={24} color="white" />
        </TouchableOpacity>
      </View>

      <Text style={tw`text-base font-bold text-gray-700 mb-4`}>
        TO DO
      </Text>

      <FlatList
        style={tw`px-1`}
        data={semuaKerjaan}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        ListEmptyComponent={
          <View style={tw`flex-1 items-center justify-center py-8`}>
            <Text style={tw`text-gray-500 text-lg`}>Tidak ada tugas. Tambah sesuatu!</Text>
          </View>
        }
      />
    </View>
  );
};

export default index;